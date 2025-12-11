import { envVars } from "@/lib/env";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const DMS_URL = new URL(`${(envVars.dms??"")}/**`);
const imagesUrl = [ new URL("https://acc-ckan-malmo.dataplatform.se/**") ];
const nextConfig: NextConfig = {
    images:{
        remotePatterns: [ DMS_URL, ...imagesUrl ]
    }
};

export default withNextIntl(nextConfig);