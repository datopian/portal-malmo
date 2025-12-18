import { envVars } from "@/lib/env";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const imagesUrl = [
  envVars.dms ?? "",
  "https://ckan-malmo.dataplatform.se",
  "https://acc-ckan-malmo.dataplatform.se",
].map((url) => new URL(`${url}/**`));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imagesUrl,
  },
};

export default withNextIntl(nextConfig);
