import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@hp-mis/design-tokens",
    "@hp-mis/i18n",
    "@hp-mis/shared-mock",
    "@hp-mis/types",
    "@hp-mis/ui",
    "@hp-mis/fixtures",
  ],
  reactStrictMode: true,
};

export default nextConfig;
