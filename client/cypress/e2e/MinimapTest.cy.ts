///<reference types="cypress" />

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: When user has selected a mininode on the minimap, should be able to update coordinates via input form", () => {
    let getReqAlias: string;
    let patchReqAlias: string;

    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser) return;
      [getReqAlias, patchReqAlias] = interceptMinimapData(
        actions.getRequest,
        actions.patchRequest,
      );
      expandMiniMap();
      editSelectedNode();
    });

    it(`Testing: user changes x coordinates input in the form, the targeted mininode position changes correctly`, () => {
      if (zone.adminUser) {
        cy.wait(getReqAlias).then(() => {
          const randX = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("x", String(randX));

          cy.get("button").contains("Save").click({ force: true }); // submit to save

          cy.wait(patchReqAlias).then(() => {
            cy.wait(getReqAlias).then(() => {
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
        cy.wait(getReqAlias).then(() => {
          const randY = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("y", String(randY));

          cy.get("button").contains("Save").click({ force: true }); // submit to save

          cy.wait(patchReqAlias).then(() => {
            cy.wait(getReqAlias).then(() => {
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
