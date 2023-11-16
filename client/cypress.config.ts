import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      "https://prism-015.uqcloud.net",
      "https://prism-014.uqcloud.net",
      "https://prism-017.uqcloud.net",
      "https://prism-018.uqcloud.net",
      "https://prism-019.uqcloud.net",
      "https://prism-020.uqcloud.net",
      "https://prism-021.uqcloud.net",
    ],
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    baseUrl: "http://localhost:3000",
    supportFile: false,
    screenshotOnRunFailure: false,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
