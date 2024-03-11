///<reference types="cypress" />

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  actions,
} from "../support/minimapUtils";

function typeRotation(rotation: number) {
  cy.get("input[id='orientation']").should("exist").clear();
  cy.get("input[id='orientation']").should("exist").type(String(rotation));
}

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
  describe(`Test case: User inputs on the edit node position form`, () => {
    beforeEach(function () {
      if (!zone.adminUser) this.skip();
      cy.accessZone(zone);
      expandMiniMap();
      editSelectedNode();
    });

    it(`Testing: user changes rotation affects the red arrow`, () => {
      cy.get("[data-cy='rotation-offset-arrow']")
        .should("exist")
        .parent()
        .parent()
        .invoke("css", "transform")
        .then((originalTransformVal) => {
          const originalTransformAngle =
            convertTransformToDegrees(originalTransformVal);

          const inputVal = originalTransformAngle === 90 ? 180 : 90;

          typeRotation(inputVal);

          cy.get("[data-cy='rotation-offset-arrow']")
            .parent()
            .parent()
            .invoke("css", "transform")
            .then((transformVal) => {
              const transformedAngle = convertTransformToDegrees(transformVal);

              expect(originalTransformAngle).to.not.equal(transformedAngle);

              expect(transformedAngle).to.be.closeTo(inputVal, 1);
            });
        });
    });
    it(`Testing: Arrow should update upon clicking save`, () => {
      const [getReqAlias, patchReqAlias, patchReqRotAlias] =
        interceptMinimapData(
          actions.getRequest,
          actions.patchCoordinatesRequest,
          actions.patchRotationRequest,
        );
      cy.get("[data-cy='rotation-offset-arrow']")
        .should("exist")
        .parent()
        .parent()
        .invoke("css", "transform")
        .then((originalTransformVal) => {
          const originalTransformAngle =
            convertTransformToDegrees(originalTransformVal);

          const inputVal = originalTransformAngle === 90 ? 180 : 90;

          typeRotation(inputVal);

          cy.get("button").contains("Save").click({ force: true });
          cy.wait(patchReqAlias)
            .wait(patchReqRotAlias)
            .wait(getReqAlias)
            .then(() => {
              cy.get("[data-cy='rotation-offset-arrow']").should("not.exist");
              cy.get("p")
                .contains("Edit Node")
                .should("exist")
                .click({ force: true });

              cy.get("[data-cy='selected-node']").click({ force: true });

              cy.get("[data-cy='rotation-offset-arrow']")
                .should("exist")
                .parent()
                .parent()
                .invoke("css", "transform")
                .then((transformVal) => {
                  const transformedAngle =
                    convertTransformToDegrees(transformVal);

                  expect(transformedAngle).to.be.closeTo(inputVal, 1);
                });
            });
        });
    });
  });
});
