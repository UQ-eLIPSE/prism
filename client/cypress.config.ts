import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    username: process.env.CYPRESS_USERNAME,
    password: process.env.CYPRESS_PASSWORD,
    deployedZones: [
      
      //for local test, depending project with/without timeline      
      // {"url":"http://localhost:3000", "singleSite": true, "hotspots": false, "timeline": true},
      
      //single site without hotspots, with timeline
      {"url":"https://prism-015.uqcloud.net", "singleSite": true, "hotspots": false, "timeline": true}, 
      
      //single site without hotspots, with timeline
      {"url":"https://prism-014.uqcloud.net", "singleSite": true, "hotspots": false, "timeline": true}, 
      
      //single site without hotspots, with timeline
      {"url":"https://prism-017.uqcloud.net", "singleSite": true, "hotspots": false, "timeline": true}, 
      
      //single site without hotspots, with timeline
      {"url":"https://prism-018.uqcloud.net", "singleSite": true, "hotspots": false, "timeline": true}, 
      
      //multi sites with hotspots, without timeline
      {"url":"https://prism-019.uqcloud.net", "singleSite": false, "hotspots": true, "timeline": false}, 
      
      //single site with hotspots, with timeline
      {"url":"https://prism-020.uqcloud.net", "singleSite": true, "hotspots": true, "timeline": true}, 
      
      //single site without hotspots, with timeline
      {"url":"https://prism-021.uqcloud.net", "singleSite": true, "hotspots": false, "timeline": true}, 
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
