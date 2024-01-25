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
        cy.get("[data-cy='seleted-node']").click();
        cy.get("input[id='x']").should("exist").type("80");

        cy.get("img[class*='minimap_largeMapImg']").then(($img) => {
          const totalWidth = $img.width();
          cy.get("[data-cy='selected-node']")
            .parent()
            .should(($parent) => {
              // const leftPixelValue = parseFloat($parent.css("left"));
              // const leftPercentage = (leftPixelValue / totalWidth) * 100;
              const leftPercentage = percentageCal($parent, totalWidth);
              expect(leftPercentage).to.be.closeTo(80, 1);
            });
          cy.get("button").contains("Save").click();
          cy.get("[data-cy='selected-node']")
            .parent()
            .should(($parent) => {
              const leftPercentage = percentageCal($parent, totalWidth);
              expect(leftPercentage).to.be.closeTo(80, 1);
            });
        });
      }
    });
  });
});

const percentageCal = (node: any, imgSize: number): number => {
  const pixelValue = parseFloat(node.css("left"));
  const percentage = (pixelValue / imgSize) * 100;
  return percentage;
};
