///<reference types="cypress" />

import { testEachZone } from "../testutils";
import { expandMiniMap, editSelectedNode } from "../support/minimapUtils";

// Helper converts the matrix values to understandable degree values
const convertTransformToDegrees = (
  transformVal: JQuery.PlainObject<string>,
): number => {
  const matchResult = /matrix.*\((.+)\)/.exec(transformVal.toString());

  if (matchResult) {
    const values = matchResult[1].split(", ");

    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);

    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle;
  }
  return -1;
};

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Black and red arrow exists and is pointing the right way", () => {
    beforeEach(function () {
      if (!zone.adminUser) this.skip();
      cy.accessZone(zone);
      expandMiniMap();
      editSelectedNode();
    });

    it(`Testing: Black arrow controlling the yaw exists, is visible, and is pointing the right way`, () => {
      cy.get("[data-cy='yaw-arrow']").should("exist");
      cy.get("[data-cy='viewParam-currYaw-value']")
        .should("exist")
        .invoke("text")
        .then((text) => {
          const value = text.split(":")[1].trim();
          const expectedRotation = Number(value.split("°")[0]);
          // Check if value is a nan if not. Then just skip the test
          if (isNaN(expectedRotation)) return;

          cy.get("[data-cy='yaw-arrow']")
            .parent()
            .parent()
            .invoke("css", "transform")
            .then((transformVal) => {
              // Compare tranfsorm value with the value from the input
              const transformedAngle = convertTransformToDegrees(transformVal);

              expect(transformedAngle).to.be.closeTo(expectedRotation, 1);
            });
        });
    });

    it(`Tesing: Red arrow controlling the rotation offset exists and is visible`, () => {
      cy.get("[data-cy='rotation-offset-arrow']").should("exist");
      cy.get("[data-cy='currRotation-offset-value']")
        .should("exist")
        .invoke("text")
        .then((text) => {
          const value = text.split(":")[1].trim();
          const expectedRotation = Number(value.split("°")[0]);
          // Check if value is a nan if not. Then just skip the test
          if (isNaN(expectedRotation)) return;

          cy.get("[data-cy='rotation-offset-arrow']")
            .parent()
            .parent()
            .invoke("css", "transform")
            .then((transformVal) => {
              // Compare transform value with the value from the input
              const transformedAngle = convertTransformToDegrees(transformVal);

              expect(transformedAngle).to.be.closeTo(expectedRotation, 1);
            });
        });
    });
  });
});
