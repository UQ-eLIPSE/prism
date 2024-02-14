import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Marzipano node configuration when traversing between different floors", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: New Marzipano should be created`, () => {
      if (!zone.floors) return;

      cy.get("#pano").should("exist");
    });

    it(`Testing: Canvas element with id "pano" should exist`, () => {
      if (!zone.floors) return;

      cy.get("#pano canvas").should("exist");
    });
  });
});
