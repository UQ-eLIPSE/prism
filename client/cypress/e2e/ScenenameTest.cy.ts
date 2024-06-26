import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Scene Name Displaying in div .title-card", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });
    it(`Testing:  Scene Name Displaying in div .title-card`, () => {
      if (zone.hotspots) {
        cy.get("[class^='_minimap_closeShow']").should("exist").click();
        cy.get("[data-cy=selected-node]")
          .should("exist")
          .parent("[class^='_minimap_nodeContainer']")
          .should("exist")
          .parent()
          .children("div[class*='nodeTitle']")
          .should("exist")
          .invoke("text")
          .then((text) => {
            cy.get("[data-cy='facility-name-title']")
              .invoke("text")
              .should("eq", text.trim());
          });
      }
    });
  });
});
