/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // Belt-and-suspenders: Next's tracer usually follows better-sqlite3's
    // `bindings` lookup on its own, but pin the native binary explicitly so a
    // tracer regression can't ship a standalone bundle that crashes on first
    // DB access. (Top-level outputFileTracingIncludes is Next 15+ — in 14.x
    // the key lives under `experimental`.)
    outputFileTracingIncludes: {
      "/api/**/*": ["./node_modules/better-sqlite3/build/Release/*.node"],
    },
  },
};

export default nextConfig;
