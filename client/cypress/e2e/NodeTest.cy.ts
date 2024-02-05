import { testEachZone } from "../testutils";
import { expandMiniMap } from "../support/minimapUtils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user has clicked on the minimap, nodes should be displayed", () => {
    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser) return;
      expandMiniMap();
    });

    it("should display the nodes", () => {
      // Adjust this to target your NodeComponent specifically, perhaps by data-cy attribute

      cy.get("[data-cy=node]").should("exist");
      cy.get("[data-cy=selected-node]").should("exist");
    });
  });
});
