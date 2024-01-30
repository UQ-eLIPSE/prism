///<reference types="cypress" />

import { testEachZone } from "../testutils";

function editNode() {
  cy.get('i[class*="fa-expand-arrows-alt"]').click({
    timeout: 10000,
    force: true,
  });
  cy.get("p")
    .contains("Edit Node")
    .should("exist")
    .click({ force: true });
  cy.get("h2").contains("Select a Node to Edit");
}

function typeRotation(rotation:number) {
  cy.get("input[id='orientation']").should("exist").clear();
  cy.get("input[id='orientation']")
    .should("exist")
    .type(String(rotation));
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
  { degrees: 120, cssValue: "rotate(2.09439rad)"},
  { degrees: 150, cssValue: "rotate(2.61799rad)"},
  { degrees: 180, cssValue: "rotate(3.14159rad)"},
  { degrees: 210, cssValue: "rotate(3.66519rad)"},
  { degrees: 240, cssValue: "rotate(4.18879rad)"},
];

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

    it(`Testing: user changes rotation coordinate input in the form, the targeted mininode rotation changes correctly when pressing the "Save node" button`, () => {
      if (zone.adminUser) {
        cy.intercept("PATCH", "/api/node/coords/*").as("patchNodeCoords");
        cy.intercept("PATCH", "/api/node/rotation/*").as("patchNodeRoration");
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite*").as(
          "getMinimapData",
        );

        editNode();

        const randTuple = rotationValues[Math.floor(Math.random() * rotationValues.length)];

        cy.get("[data-cy='selected-node']").click({ force: true });
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

        editNode();

        const randTuple = rotationValues[Math.floor(Math.random() * rotationValues.length)];

        cy.get("[data-cy='selected-node']").click({ force: true });
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

  });
});
