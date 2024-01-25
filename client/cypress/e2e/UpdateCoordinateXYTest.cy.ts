///<reference types="cypress" />

import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user selected a mininode on minimap, should be able to update coordinates via input form", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: user changes coordinates input in the form, the targeted mininode position changes correctly based on user input`, () => {
      if (zone.adminUser) {
        cy.get('i[class*="fa-expand-arrows-alt"]').click({ force: true });
        cy.get("p").contains("Edit Node").should("exist").click();
        cy.get("h2").contains("Select a Node to Edit");
        cy.get("[data-cy='selected-node']").click();
        const randX = Math.floor(Math.random() * 101);
        cy.get("input[id='x']").should("exist").clear();
        cy.get("input[id='x']").should("exist").type(String(randX));
        cy.get("button").contains("Save").click();        
        cy.get("img[class*='minimap_largeMapImg']").then(($img) => {
          const totalWidth = $img.width();
          cy.wrap(totalWidth).should('not.be.undefined');          
          cy.get("[data-cy='selected-node']")
            .parent()
            .should(($parent) => {
              const leftPixelValue = parseFloat($parent.css("left"));
              const leftPercentage = (leftPixelValue / (totalWidth as number)) * 100;
              expect(leftPercentage).to.be.closeTo(randX, 1);
          });
        });     
      }
    });
  });
});
