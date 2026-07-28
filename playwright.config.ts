import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: process.env.CI ? "github" : "list",
  retries: 0,
  testDir: "./tests",
  use: { baseURL: `http://localhost:${PORT}/burger/` },
  // Serves the same artifact that deploys, so the tests exercise the built CSS and
  // the bundled module rather than the sources.
  webServer: {
    command: `npm run build && npm run build:site && npx serve -l ${PORT} site`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `http://localhost:${PORT}/burger/`,
  },
});
