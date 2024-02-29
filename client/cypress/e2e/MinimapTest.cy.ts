///<reference types="cypress" />

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";
import "cypress-real-events";

function typeRotation(rotation: number) {
  cy.get("input[id='orientation']").should("exist").clear();
  cy.get("input[id='orientation']").should("exist").type(String(rotation));
}

/**
 * Extracts the rotation value from a rotation styled string.
 * i.e. "rotate(0.523599rad)" -> 0.523599
 * @param rotationStyle "rotate({value}rad)"
 * @returns {number} The rotation value in radians.
 */
function extractRotationValue(rotationStyle: string): number {
  const match = rotationStyle.match(/rotate\((.*?)rad\)/);
  return match && match[1] ? parseFloat(match[1]) : 0;
}

function getRotationValue(selector: string): Cypress.Chainable<number> {
  return cy
    .get(selector)
    .parent()
    .should("exist")
    .should("have.attr", "style")
    .then((style: unknown) => {
      return extractRotationValue(style as string);
    });
}

/**
 * Extracts a numeric value from a text based on a given label.
 * @param label - The label to search for in the text.
 * @param text - The text to search for the label and extract the numeric value from.
 * @returns {number} The extracted numeric value, or 0 if no match is found.
 */
function extractNumberFromLabel(label: string, text: string): number {
  // Use a regular expression to extract the numeric value
  const regex = new RegExp(`${label}: ([\\d.]+)°`);
  const match = regex.exec(text);

  // If there's no match, return 0
  if (!match) return 0;

  // Convert the matched string to a number and return it
  return parseFloat(match[1]);
}

/**
 * Adds rotation to the given style string.
 * i.e. "rotate(0.523599rad)" + 1.5708rad = "rotate(2.09439rad)"
 * @param rotationStyle - The original rotation style string.
 * @param rotationDegrees - The rotation in degrees to be added.
 * @returns {string} The updated rotation style string.
 */
function addRotationToStyle(
  rotationStyle: string,
  rotationDegrees: number,
): string {
  // Extract the original rotation value in radians from the rotation style string
  const rotationMatch = /rotate\(([^)]+)rad\)/.exec(rotationStyle);
  if (!rotationMatch) return rotationStyle;
  const originalRotationInRadians = parseFloat(rotationMatch[1]);

  // Convert the rotation in degrees to radians
  const rotationInRadians = rotationDegrees * (Math.PI / 180);

  // Add the rotations
  const newRotationInRadians = originalRotationInRadians + rotationInRadians;

  return `rotate(${newRotationInRadians}rad)`;
}

const rotationValues: { degrees: number; cssValue: string }[] = [
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
    let patchReqRotAlias: string;

    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser) return;
      [getReqAlias, patchReqAlias, patchReqRotAlias] = interceptMinimapData(
        actions.getRequest,
        actions.patchCoordinatesRequest,
        actions.patchRotationRequest,
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
      if (!zone.adminUser || !zone.rotation) return;
      const randTuple =
        rotationValues[Math.floor(Math.random() * rotationValues.length)];
      cy.wait(getReqAlias).then(() => {
        cy.get("[data-cy='viewParam-currYaw-value']")
          .should("exist")
          .invoke("text")
          .then((text) => {
            const initialYawValue = extractNumberFromLabel(
              text.split(":")[0],
              text,
            );
            typeRotation(randTuple.degrees);
            cy.get("[data-cy='edit-save-button']").contains("Save").click();
            cy.wait(patchReqAlias)
              .wait(patchReqRotAlias)
              .wait(getReqAlias)
              .then(() => {
                const newRotationStyle = addRotationToStyle(
                  randTuple.cssValue,
                  initialYawValue,
                );
                getRotationValue("[data-cy='selected-node']").then((actual) => {
                  expect(actual).to.be.closeTo(
                    extractRotationValue(newRotationStyle),
                    0.1,
                  );
                });
              });
          });
      });
    });

    it(`Testing: user changes rotation coordinate input in the form, the targeted mininode rotation changes correctly when pressing the "Save" button`, () => {
      if (!zone.adminUser || !zone.rotation) return;
      const randTuple =
        rotationValues[Math.floor(Math.random() * rotationValues.length)];
      cy.wait(getReqAlias).then(() => {
        cy.get("[data-cy='viewParam-currYaw-value']")
          .should("exist")
          .invoke("text")
          .then((text) => {
            const initialYawValue = extractNumberFromLabel(
              text.split(":")[0],
              text,
            );
            typeRotation(randTuple.degrees);
            cy.get("[data-cy='submit-button']").contains("Save").click();
            cy.wait(patchReqAlias)
              .wait(patchReqRotAlias)
              .wait(getReqAlias)
              .then(() => {
                const newRotationStyle = addRotationToStyle(
                  randTuple.cssValue,
                  initialYawValue,
                );
                getRotationValue("[data-cy='selected-node']").then((actual) => {
                  expect(actual).to.be.closeTo(
                    extractRotationValue(newRotationStyle),
                    0.1,
                  );
                });
              });
          });
      });
    });

    it(`Testing: rotation coordinate should not change when user cancels form submission`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='orientation']").then(($input) => {
          const originalR = $input.val();
          expect(originalR).to.not.be.undefined;

          // Generate a random value for rotation
          const randTuple =
            rotationValues[Math.floor(Math.random() * rotationValues.length)];
          editNodePosition("orientation", String(randTuple.degrees));

          cy.get("button").contains("Cancel").click({ force: true });
          cy.wait(getReqAlias).then(() => {
            editSelectedNode();
            cy.get("input[id='orientation']").should(($input) => {
              expect($input.val()).to.eq(originalR);
            });
          });
        });
      });
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
