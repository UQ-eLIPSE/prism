import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
  },
  e2e: {
    // Your project's end-to-end testing configuration
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    // baseUrl: "http://localhost:3000",
    baseUrl: "https://prism-021.uqcloud.net", // Adjust to your application's URL
    //additional configurations...
    supportFile: false,
    screenshotOnRunFailure: false,
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
