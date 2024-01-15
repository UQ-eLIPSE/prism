import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case:prism Logo", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing in each Zone: should compare elements with .hotspot-tooltip and .linkNodeNames on the first landing view`, () => {
      cy.get("div.prism-logo .prismLogo").should("exist");
    });
  });
});
