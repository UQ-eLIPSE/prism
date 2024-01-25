import { defineConfig } from "cypress";
import {}
export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      //for local test, depending project with/without timeline
      {
        url: "http://localhost:3000",
        singleSite: false,
        hotspots: true,
        timeline: false,
        appUserSso: false
      },
    ],
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    baseUrl: "https://prism-021.uqcloud.net",
    supportFile: "cypress/support/index.ts",
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
