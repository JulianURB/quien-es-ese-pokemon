import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// NOTE: basePath lo aplica el builder de Webflow Cloud según el mount path.
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Expone el mount path al cliente: basePath no prefija los fetch().
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.COSMIC_MOUNT_PATH || "",
  },
};

export default nextConfig;

// En `next dev` conecta los bindings (D1 local en .wrangler/).
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
