import { editSelectedNode, expandMiniMap } from "../support/minimapUtils";
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
});
