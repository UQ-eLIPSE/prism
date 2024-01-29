///<reference types="cypress"/>

import { testEachZone } from "../testutils";
import {
  interceptMinimapData,
  expandMiniMap,
  editSelectedNode,
  editNodePosition,
  actions,
} from "../support/minimapUtils";

testEachZone((zone: Cypress.PrismZone) => {
  describe(`Test case: Form should disappear upon submission or cancellation`, () => {
    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser) return;
      expandMiniMap();
      editSelectedNode();
    });

    it(`Testing: Form should disappear upon cancellation`, () => {
      if (!zone.adminUser) return;

      cy.get("div.controls.visible").should("exist");
      cy.get("button").contains("Cancel").click({ force: true });
      cy.get("div.controls.visible").should("not.exist");
      cy.get("div.controls").should("exist");
    });

    it(`Testing: Form should disappear upon submission`, () => {
      if (!zone.adminUser) return;

      cy.get("div.controls.visible").should("exist");
      cy.get("button").contains("Save").click({ force: true });
      cy.get("div.controls.visible").should("not.exist");
      cy.get("div.controls").should("exist");
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

          cy.get("button").contains("Cancel").click({ force: true });
          editSelectedNode();

          cy.get("input[id='x']").should(($input) => {
            expect($input.val()).to.eq(originalX);
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
        cy.get("input[id='x']").then(($input) => {
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
        cy.get("input[id='y']").then(($input) => {
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
