///<reference types="cypress"/>

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";

const DELAY: number = 500; // to prevent async issues that sometimes happen causing multiple retries

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

    it(`Testing: tile Name should not change when user cancels form submission`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='tileName']").then(($input) => {
          const original = $input.val();
          expect(original).to.not.be.undefined;

          // Generate a random value for x
          const newValue = "Kitchen";
          editNodePosition("tileName", newValue);

          cy.wait(getReqAlias).then(() => {
            cy.get("button").contains("Cancel").click({ force: true });
            editSelectedNode();

            cy.get("input[id='tileName']").should(($input) => {
              expect($input.val()).to.eq(original);
            });
          });
        });
      });
    });
  });

  

  describe(`Test case: Value should be changed and saved when user submits a different value, and reopens the same form`, () => {
    let getReqAlias: string;
    let patchReqCoordinatesAlias: string;
    let patchTileNameAlias: string;

    beforeEach(() => {
      cy.accessZone(zone);
      cy.wait(DELAY);

      if (!zone.adminUser) return;

      [getReqAlias, patchReqCoordinatesAlias, patchTileNameAlias] = interceptMinimapData(
        actions.getRequest,
        actions.patchCoordinatesRequest,
        actions.patchTileNameRequest,
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
            cy.wait(DELAY);
            cy.wait(patchReqCoordinatesAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                editSelectedNode(); // to open form again
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
            cy.wait(DELAY);
            cy.wait(patchReqCoordinatesAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                editSelectedNode();
                cy.get("input[id='y']").should(($input) => {
                  expect($input.val()).to.eq(String(randY));
                });
              });
            });
          });
      });
    });

    it.only(`Testing: Tile Name should be saved when user submits a different value`, () => {
      if (!zone.adminUser) return;

      cy.wait(getReqAlias).then(() => {
        cy.get("input[id='tileName']")
          .should("exist")
          .then(($input) => {
            const original = $input.val();
            expect(original).to.not.be.undefined;

            // Generate a random value for y
            const newValue = "Theater";
            editNodePosition("tileName", newValue);

            cy.get("button").contains("Save").click({ force: true });
            cy.wait(DELAY);
            cy.wait(patchTileNameAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                editSelectedNode();
                cy.get("input[id='tileName']").should(($input) => {
                  expect($input.val()).to.eq(newValue);
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
            cy.wait(DELAY);
            cy.wait(patchReqCoordinatesAlias).then(() => {
              cy.wait(getReqAlias).then(() => {
                editSelectedNode();
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
