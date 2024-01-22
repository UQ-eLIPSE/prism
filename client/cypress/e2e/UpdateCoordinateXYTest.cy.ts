///<reference types="cypress" />

import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user selected a mininode on minimap, should be able to update coordinates via input form", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: user changes coordinates input in the form, the targeted mininode position changes correctly based on user input`, () => {
      if (zone.timeline) {
        cy.get('i[class*="fa-expand-arrows-alt"]').click({ force: true });
        cy.get("p").contains("Edit Node").should("exist").click();
        cy.get("#drawer-container").should("exist");
        cy.get("h2").contains("Select a Node to Edit");
        cy.get("#0-0_1_91_34_221130-panorama").click();
        cy.get("input[id='x']").should("exist").type("90");
        cy.get("#0-0_1_91_34_221130-panorama")
          .parent()
          .should(($parent) => {
            const leftStyle = $parent.css("left");
            const leftPercentage = parseFloat(leftStyle);

            expect(leftPercentage).to.equal(90);
          });

        cy.get("button").contains("Save").click();
        cy.get("#0-0_1_91_34_221130-panorama")
          .parent()
          .should(($parent) => {
            const leftStyle = $parent.css("left");
            const leftPercentage = parseFloat(leftStyle);
            expect(leftPercentage).to.equal(90);
          });
      }
    });
  });
});
