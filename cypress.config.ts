import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";

type RouteFile = { routes: string[] };

function loadRoutes(): string[] {
  const filePath = path.resolve(process.cwd(), "public/__routes.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as RouteFile;
  return parsed.routes ?? [];
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx,js,jsx}",
    video: false,
    setupNodeEvents(on, config) {
      config.env.routes = loadRoutes();
      return config;
    },
  },
});
