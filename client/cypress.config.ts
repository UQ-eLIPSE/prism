import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      //for local test, depending project with/without timeline
      {
        project: "localAgco360",
        url: "http://localhost:3000",
        singleSite: false,
        hotspots: true,
        timeline: false,
        floors: false,
        // if REACT_APP_USE_SSO is false, set this to true.
        adminUser: true,
      },
      {
        project: "localUwmt",
        url: "http://localhost:3000",
        singleSite: true,
        hotspots: true,
        timeline: false,
        floors: false,
        // if REACT_APP_USE_SSO is false, set this to true.
        adminUser: true,
      },
      {
        project: "localGeneral",
        url: "http://localhost:3000",
        singleSite: true,
        hotspots: false,
        timeline: true,
        floors: true,
        // if REACT_APP_USE_SSO is false, set this to true.
        adminUser: true,
      },
    ],
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    baseUrl: "https://prism-023.uqcloud.net",
    supportFile: "cypress/support/index.ts",
    screenshotOnRunFailure: false,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  retries: 3,
});
