///<reference types="cypress" />

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";

function typeRotation(rotation: number) {
  cy.get("input[id='orientation']").should("exist").clear();
  cy.get("input[id='orientation']").should("exist").type(String(rotation));
}

function checkStyleContains(styleString: string) {
  cy.get("[data-cy='selected-node']")
    .parent()
    .should("have.attr", "style")
    .should("contain", styleString);
}

const rotationValues = [
  { degrees: 30, cssValue: "rotate(0.523599rad)" }, // degrees / 57.2958 = rad
  { degrees: 60, cssValue: "rotate(1.0472rad)" },
  { degrees: 90, cssValue: "rotate(1.5708rad)" },
  { degrees: 120, cssValue: "rotate(2.09439rad)" },
  { degrees: 150, cssValue: "rotate(2.61799rad)" },
  { degrees: 180, cssValue: "rotate(3.14159rad)" },
  { degrees: 210, cssValue: "rotate(3.66519rad)" },
  { degrees: 240, cssValue: "rotate(4.18879rad)" },
];

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

    it(`Testing: user changes rotation coordinate input in the form, the targeted mininode rotation changes correctly when pressing the "Save node" button`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNodeCoords");
        cy.intercept("PATCH", "/api/node/rotation/*").as("patchNodeRoration");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );

        const randTuple =
          rotationValues[Math.floor(Math.random() * rotationValues.length)];
        cy.wait("@getMinimapData").then(() => {
          typeRotation(randTuple.degrees);
          cy.get("[data-cy='edit-save-button']").contains("Save").click();
          cy.wait("@patchNodeCoords")
            .wait("@patchNodeRoration")
            .wait("@getMinimapData")
            .then(() => {
              checkStyleContains(`transform: ${randTuple.cssValue}`);
            });
        });
      }
    });

    it(`Testing: user changes rotation coordinate input in the form, the targeted mininode rotation changes correctly when pressing the "Save" button`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNodeCoords");
        cy.intercept("PATCH", "/api/node/rotation/*").as("patchNodeRoration");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );

        const randTuple =
          rotationValues[Math.floor(Math.random() * rotationValues.length)];
        cy.wait("@getMinimapData").then(() => {
          typeRotation(randTuple.degrees);
          cy.get("[data-cy='submit-button']").contains("Save").click();
          cy.wait("@patchNodeCoords")
            .wait("@patchNodeRoration")
            .wait("@getMinimapData")
            .then(() => {
              checkStyleContains(`transform: ${randTuple.cssValue}`);
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
