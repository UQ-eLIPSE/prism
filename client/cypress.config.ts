import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      // "http://localhost:3000", //for local test, depending project with/without timeline
      "https://prism-015.uqcloud.net", //single site without hotspots, with timeline
      "https://prism-014.uqcloud.net", //single site without hotspots, with timeline
      "https://prism-017.uqcloud.net", //single site without hotspots, with timeline
      "https://prism-018.uqcloud.net", //single site without hotspots, with timeline
      "https://prism-019.uqcloud.net", //multi sites with hotspots, without timeline
      "https://prism-020.uqcloud.net", //single site with hotspots, with timeline
      "https://prism-021.uqcloud.net", //single site without hotspots, with timeline
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
  retries: 2,
});
