"use strict";

const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const { spawn } = require("node:child_process");

const isDev = !app.isPackaged;

let mainWindow = null;
let nextProcess = null;

async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() > deadline) reject(new Error(`timeout waiting for ${url}`));
        else setTimeout(check, 200);
      });
      req.setTimeout(2000, () => req.destroy());
    };
    check();
  });
}

async function startEmbeddedNext() {
  const port = await findFreePort();
  const resourcesRoot = process.resourcesPath;
  const standaloneDir = path.join(resourcesRoot, "app");
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

  nextProcess.stdout.on("data", (d) => process.stdout.write(`[next] ${d}`));
  nextProcess.stderr.on("data", (d) => process.stderr.write(`[next] ${d}`));
  nextProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Next.js server exited with code ${code}`);
      app.quit();
    }
  });

  await waitForServer(`http://127.0.0.1:${port}/`);
  return port;
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
    const port = isDev ? 3000 : await startEmbeddedNext();
    if (isDev) await waitForServer(`http://127.0.0.1:${port}/`);
    createWindow(`http://127.0.0.1:${port}/`);
  } catch (err) {
    console.error("Failed to start AdminSimpl:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow) {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextProcess && !nextProcess.killed) nextProcess.kill();
});
