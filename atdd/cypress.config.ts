import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Your project's end-to-end testing configuration
    setupNodeEvents(on, config) {
      // handle events here
    },
    specPattern: "e2e/**/*.cy.{js,ts}",
    baseUrl: "https://prism-020.uqcloud.net", // Adjust to your application's URL
    // additional configurations...
    supportFile: false,
  },
  // Add any plugins you are using
  component: {
    // Component testing configurations if you are using it
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
