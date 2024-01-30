///<reference types="cypress"/>

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";

const ROTATION_STEP_VALUE = 15;

testEachZone((zone: Cypress.PrismZone) => {
  describe(`Test case: Form should disappear upon submission or cancellation`, () => {
    beforeEach(() => {
      cy.accessZone(zone);
      cy.wrap(zone.adminUser).should("be.true");
      expandMiniMap();
      editSelectedNode();
    });

    /**
     * Helper function to check visibilithy of form after submission or cancellation
     * @param {string} submitBtnText Text of the button to click
     * @param {boolean} formShouldBeVisible True if form should be visible, false otherwise
     * @param {string} checkControlsVisible query selector for the controls
     */
    const submitAndCheckFormVisibility = (
      submitBtnText: string,
      formShouldBeVisible: boolean,
      checkControlsVisible: string,
    ): void => {
      cy.get("button").contains(submitBtnText).click({ force: true });

      formShouldBeVisible
        ? cy.get(checkControlsVisible).should("exist")
        : cy.get(checkControlsVisible).should("not.exist");
    };

    it(`Testing: Form should disappear upon cancellation`, () => {
      cy.get("div.controls.visible").should("exist");
      submitAndCheckFormVisibility("Cancel", false, "div.controls.visible");
    });

    it(`Testing: Form should disappear upon submission`, () => {
      cy.get("div.controls.visible").should("exist");
      submitAndCheckFormVisibility("Save", false, "div.controls.visible");
    });
  });

  describe(`Test case: 'Value should not be saved when user cancels form submission'`, () => {
    let getReqAlias: string;

    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser) return;
      [getReqAlias] = interceptMinimapData(actions.getRequest);
      expandMiniMap();
      editSelectedNode();
    });

    it(`Testing: x-coordinates should not change when user cancels form submission`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='x']").then(($input) => {
          const originalX = $input.val();
          expect(originalX).to.not.be.undefined;

          // Generate a random value for x
          const randX = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("x", String(randX));

          cy.wait(getReqAlias).then(() => {
            cy.get("button").contains("Cancel").click({ force: true });
            editSelectedNode();

            cy.get("input[id='x']").should(($input) => {
              expect($input.val()).to.eq(originalX);
            });
          });
        });
      });
    });

    it(`Testing: y-coordinates should not change when user cancels form submission`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='y']").then(($input) => {
          const originalY = $input.val();
          expect(originalY).to.not.be.undefined;

          // Generate a random value for y
          const randY = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("y", String(randY));

          cy.get("button").contains("Cancel").click({ force: true });
          editSelectedNode();

          cy.get("input[id='y']").should(($input) => {
            expect($input.val()).to.eq(originalY);
          });
        });
      });
    });
  });

  describe(`Test case: Value should be changed and saved when user submits a different value, and reopens the same form`, () => {
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

    it(`Testing: x-coordinates should be saved when user submits a different value`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='x']")
          .should("exist")
          .then(($input) => {
            const originalX = $input.val();
            expect(originalX).to.not.be.undefined;

            // Generate a random value for x
            const randX = Math.floor(Math.random() * 9) * 10 + 10;
            editNodePosition("x", String(randX));

            cy.get("button").contains("Save").click({ force: true });
            cy.wait(patchReqAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                cy.get("input[id='x']").should(($input) => {
                  expect($input.val()).to.eq(String(randX));
                });
              });
            });
          });
      });
    });

    it(`Testing: y-coordinates should be saved when user submits a different value`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='y']")
          .should("exist")
          .then(($input) => {
            const originalY = $input.val();
            expect(originalY).to.not.be.undefined;

            // Generate a random value for y
            const randY = Math.floor(Math.random() * 9) * 10 + 10;
            editNodePosition("y", String(randY));

            cy.get("button").contains("Save").click({ force: true });
            cy.wait(patchReqAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                cy.get("input[id='y']").should(($input) => {
                  expect($input.val()).to.eq(String(randY));
                });
              });
            });
          });
      });
    });

    it(`Testing: rotation value should be saved when user submits a different value`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='orientation']")
          .should("exist")
          .then(($input) => {
            // Check it has a step of step of 15.
            const stepAttribute = $input.attr("step");
            expect(stepAttribute).to.eq(String(ROTATION_STEP_VALUE));

            const originalRotationVal = $input.val();
            expect(originalRotationVal).to.not.be.undefined;

            // Generate a random value for rotation between 0 and 360 in 15 degree increments starting from 0, 15, 30...
            const randRotationVal = Math.floor(Math.random() * 24) * 15;

            editNodePosition("orientation", String(randRotationVal));

            cy.get("button").contains("Save").click({ force: true });
            cy.wait(patchReqAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                cy.get("input[id='orientation']").should(($input) => {
                  expect($input.val()).to.eq(String(randRotationVal));
                });
              });
            });
          });
      });
    });

    it(`Testing: x and y coordinates should be both saved when user submits a different value`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='x']").then(($input) => {
          const originalX = $input.val();
          expect(originalX).to.not.be.undefined;

          // Generate a random value for x
          const randX = Math.floor(Math.random() * 9) * 10 + 10;
          editNodePosition("x", String(randX));

          cy.get("input[id='y']").then(($input) => {
            const originalY = $input.val();
            expect(originalY).to.not.be.undefined;

            // Generate a random value for y
            const randY = Math.floor(Math.random() * 9) * 10 + 10;
            editNodePosition("y", String(randY));

            cy.get("button").contains("Save").click({ force: true });
            cy.wait(patchReqAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                cy.get("input[id='x']").should(($input) => {
                  expect($input.val()).to.eq(String(randX));
                });
                cy.get("input[id='y']").should(($input) => {
                  expect($input.val()).to.eq(String(randY));
                });
              });
            });
          });
        });
      });
    });
  });
});
