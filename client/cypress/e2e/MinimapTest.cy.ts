///<reference types="cypress" />

import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user selected a mininode on minimap, should be able to update coordinates via input form", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    const expandMiniMap = (): void => {
      cy.get('i[class*="fa-expand-arrows-alt"]').click({
        timeout: 10000,
        force: true,
      });
    };

    const editSelectedNode = (): void => {
      cy.get("p").contains("Edit Node").should("exist").click({ force: true });
      cy.get("h2").contains("Select a Node to Edit");
      cy.get("[data-cy='selected-node']").click({ force: true });
    };

    const editNodePosition = (coordId: string, coordValue: string) => {
      cy.get(`input[id='${coordId}']`).should("exist").clear();
      cy.get(`input[id='${coordId}']`).should("exist").type(coordValue);
    };

    it(`Testing: user changes x coordinates input in the form, the targeted mininode position changes correctly`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNode");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );
        expandMiniMap();
        editSelectedNode();
        cy.wait("@getMinimapData").then(() => {
          const randX = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("x", String(randX));
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
    it(`Testing: user changes y coordinates input in the form, the targeted mininode position changes correctly`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNode");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );
        expandMiniMap();
        editSelectedNode();

        cy.wait("@getMinimapData").then(() => {
          const randY = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("y", String(randY));
          cy.get("button").contains("Save").click({ force: true });
          cy.wait("@patchNode").then(() => {
            cy.wait("@getMinimapData").then(() => {
              cy.get("img[class*='minimap_largeMapImg']").then(($img) => {
                const totalHeight = $img.height();
                cy.wrap(totalHeight).should("not.be.undefined");
                cy.get("[data-cy='selected-node']")
                  .parent()
                  .should(($parent) => {
                    const topPixelValue = parseFloat($parent.css("top"));
                    const topPercentage = Math.floor(
                      (topPixelValue / (totalHeight as number)) * 100,
                    );
                    expect(topPercentage).to.be.closeTo(randY, 1);
                  });
              });
            });
          });
        });
      }
    });
  });
});
