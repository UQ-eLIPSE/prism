import {
  actions,
  editSelectedNode,
  expandMiniMap,
  interceptMinimapData,
} from "../support/minimapUtils";
import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Edit node button should update and perform correct functionality when clicked", () => {
    beforeEach(() => {
      cy.accessZone(zone);
      expandMiniMap();
    });

    it(`Testing: Button class should be in no mode at initial render`, () => {
      cy.get('[data-cy="edit-save-button"]')
        .should("exist")
        .should("have.text", "Edit Node");
    });

    it(`Testing: Button class should be in edit mode when clicked once`, () => {
      cy.get('[data-cy="edit-save-button"]').should("exist").click();
      cy.get('[data-cy="edit-save-button"]')
        .should("exist")
        .should("have.text", "Edit Node")
        .should("have.class", "selecting");
    });

    it(`Testing: Button should be in editing/save mode when clicked and a node is selected`, () => {
      editSelectedNode();
      cy.get('[data-cy="edit-save-button"]')
        .should("exist")
        .should("have.text", "Save Node")
        .should("have.class", "editing");
    });
  });

  describe("Test case: Button should perform PATCH request on save mode when clicked", () => {
    beforeEach(() => {
      cy.accessZone(zone);
      expandMiniMap();
      editSelectedNode();
    });

    it.only(`Testing: Button should perform PATCH request when clicked in save mode`, () => {
      const [patchReqAlias, patchReqRotAlias] = interceptMinimapData(
        actions.patchCoordinatesRequest,
        actions.patchRotationRequest,
      );

      cy.get('[data-cy="edit-save-button"]').click();
      [patchReqAlias, patchReqRotAlias].forEach((alias) => {
        cy.wait(alias).its("response.statusCode").should("equal", 200);
      });
    });
  });
});
