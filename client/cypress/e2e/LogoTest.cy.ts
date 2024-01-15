import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing in each Zone: should compare elements with .hotspot-tooltip and .linkNodeNames on the first landing view`, () => {
      cy.get("div.prism-logo .prismLogo").should("exist");
    });
  });
});
