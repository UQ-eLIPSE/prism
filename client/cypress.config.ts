import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      {
        project: "agco360",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-uat.uqcloud.net",
        },
        singleSite: false,
        hotspots: true,
        timeline: false,
        floors: false,
        adminUser: true,
        rotation: true,
        documentation: false,
      },
      {
        project: "uwmt",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-uat.uqcloud.net",
        },
        singleSite: true,
        hotspots: true,
        timeline: false,
        floors: false,
        adminUser: true,
        rotation: false,
        documentation: false,
      },
      {
        project: "general",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-uat.uqcloud.net",
        },
        singleSite: true,
        hotspots: false,
        timeline: true,
        floors: true,
        adminUser: true,
        rotation: true,
        documentation: true,
      },
    ],
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    baseUrl: "https://prism-uat.uqcloud.net",
    supportFile: "cypress/support/index.ts",
    screenshotOnRunFailure: false,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  // retries: 3,
  retries: 0,
});
