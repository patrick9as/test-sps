import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    setupNodeEvents(on, config) {
      // Mitiga "Terminating renderer for bad IPC message, reason 114" no Electron (cypress open)
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--disable-gl-drawing-for-tests");
        }
        return launchOptions;
      });
    },
  },
});
