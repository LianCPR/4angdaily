/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // standalone project: no image optimization pipeline required to run
  },
  // Keep the DB client as a real server dependency instead of bundling it —
  // avoids webpack trying to process @libsql/client's native local-file bindings.
  serverExternalPackages: ["@libsql/client"],
};

module.exports = nextConfig;
