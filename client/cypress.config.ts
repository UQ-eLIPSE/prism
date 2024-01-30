import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      {
        project: "localAgco360",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-023.uqcloud.net",
          product: "",
        },
        singleSite: false,
        hotspots: true,
        timeline: false,
        floors: false,
        adminUser: true,
      },
      {
        project: "localUwmt",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-023.uqcloud.net",
          product: "",
        },
        singleSite: true,
        hotspots: true,
        timeline: false,
        floors: false,
        adminUser: true,
      },
      {
        project: "localGeneral",
        url: {
          local: "http://localhost:3000",
          uat: "https://prism-023.uqcloud.net",
          product: "",
        },
        singleSite: true,
        hotspots: false,
        timeline: true,
        floors: true,
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
