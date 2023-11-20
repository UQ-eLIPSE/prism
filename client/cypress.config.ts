import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      "https://prism-015.uqcloud.net", //single site without hotspots
      "https://prism-014.uqcloud.net", //single site without hotspots
      "https://prism-017.uqcloud.net", //single site without hotspots
      "https://prism-018.uqcloud.net", //single site without hotspots
      "https://prism-019.uqcloud.net", //multi sites with hotspots
      "https://prism-020.uqcloud.net", //single site with hotspots
      "https://prism-021.uqcloud.net", //single site without hotspots
    ],
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    baseUrl: "https://prism-021.uqcloud.net",
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
