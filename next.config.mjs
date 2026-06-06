/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Force Next's standalone tracer to pull better-sqlite3's native binary into
  // the bundle. The tracer skips .node files by default, which crashes the
  // packaged Electron app on first DB access.
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/better-sqlite3/build/Release/*.node"],
  },
};

export default nextConfig;
