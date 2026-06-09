"use strict";

const { app, BrowserWindow, session, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const { spawn } = require("node:child_process");

process.env.NEXT_TELEMETRY_DISABLED = "1";

const isDev = !app.isPackaged;

const CSP_HEADER = [
  "default-src 'self'",
  // next dev serves chunks through eval (eval-source-map); production doesn't.
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const ICON_PATH = isDev
  ? path.join(__dirname, "..", "build-resources", "icon.png")
  : path.join(process.resourcesPath, "icon.png");

let mainWindow = null;
let nextProcess = null;

function isLoopbackUrl(url) {
  const { hostname, protocol } = new URL(url);
  if (protocol === "devtools:" || protocol === "chrome-extension:") return true;
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
}

function lockdownNetwork() {
  const ses = session.defaultSession;

  ses.webRequest.onBeforeRequest((details, callback) => {
    const cancel = !isLoopbackUrl(details.url);
    if (cancel) console.warn(`[offline] blocked outbound request: ${details.url}`);
    callback({ cancel });
  });

  ses.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [CSP_HEADER],
      },
    });
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

async function startEmbeddedNext() {
  // Next's standalone server treats PORT=0 as falsy and falls back to 3000,
  // so we have to pre-allocate. There's a TOCTOU window between close() and
  // Next's bind, but it's negligible on a single-user desktop.
  const port = await findFreePort();
  const standaloneDir = path.join(process.resourcesPath, "app");
  const serverEntry = path.join(standaloneDir, "server.js");
  const dataDir = path.join(app.getPath("userData"), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  nextProcess = spawn(process.execPath, [serverEntry], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      ADMINSIMPL_DATA_DIR: dataDir,
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Wait for the "Local: http://127.0.0.1:<port>" line on stdout instead of
  // polling HTTP — Next writes it once it's actually serving.
  return new Promise((resolve, reject) => {
    const ready = `http://127.0.0.1:${port}`;
    const timer = setTimeout(
      () => reject(new Error("Next.js server didn't become ready within 30s")),
      30_000,
    );

    let resolved = false;
    nextProcess.stdout.on("data", (d) => {
      const text = d.toString();
      process.stdout.write(`[next] ${text}`);
      if (!resolved && text.includes(ready)) {
        resolved = true;
        clearTimeout(timer);
        resolve(port);
      }
    });
    nextProcess.stderr.on("data", (d) => process.stderr.write(`[next] ${d}`));
    nextProcess.on("exit", (code) => {
      if (resolved) {
        // Server died mid-session — without it every navigation fails, so quit.
        console.error(`Next.js server exited with code ${code}`);
        app.quit();
        return;
      }
      clearTimeout(timer);
      reject(new Error(`Next.js server exited with code ${code} before becoming ready`));
    });
  });
}

function createWindow(targetUrl) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#f8fafc",
    autoHideMenuBar: true,
    title: "AdminSimpl",
    icon: ICON_PATH,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(targetUrl);

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(async () => {
  try {
    lockdownNetwork();
    const port = isDev ? 3000 : await startEmbeddedNext();
    createWindow(`http://127.0.0.1:${port}/`);
  } catch (err) {
    console.error("Failed to start AdminSimpl:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextProcess && !nextProcess.killed) nextProcess.kill();
});
