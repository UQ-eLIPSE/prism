///<reference types="cypress" />

import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user selected a mininode on minimap, should be able to update coordinates via input form", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: user changes x coordinates input in the form, the targeted mininode position changes correctly`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNode");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );
        cy.get('i[class*="fa-expand-arrows-alt"]').click({
          timeout: 10000,
          force: true,
        });
        cy.get("p")
          .contains("Edit Node")
          .should("exist")
          .click({ force: true });
        cy.get("h2").contains("Select a Node to Edit");
        const randX = Math.floor(Math.random() * 9) * 10 + 10;
        cy.get("[data-cy='selected-node']").click({ force: true });
        cy.wait("@getMinimapData").then(() => {
          cy.get("input[id='x']").should("exist").clear();
          cy.get("input[id='x']").should("exist").type(String(randX));
          cy.get("button").contains("Save").click({ force: true });
          cy.wait("@patchNode").then(() => {
            cy.wait("@getMinimapData").then(() => {
              cy.get("img[class*='minimap_largeMapImg']").then(($img) => {
                const totalWidth = $img.width();
                cy.wrap(totalWidth).should("not.be.undefined");
                cy.get("[data-cy='selected-node']")
                  .parent()
                  .should(($parent) => {
                    const leftPixelValue = parseFloat($parent.css("left"));
                    const leftPercentage = Math.floor(
                      (leftPixelValue / (totalWidth as number)) * 100,
                    );
                    expect(leftPercentage).to.be.closeTo(randX, 1);
                  });
              });
            });
          });
        });
      }
    });
  });
});
