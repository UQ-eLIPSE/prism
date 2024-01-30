import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Minimap tag, floor name and image update should work", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });
    it(`Testing: Minimap Floor Name update works`, () => {
      if (zone.floors) {
        cy.intercept("PATCH", "/api/site/*/sitemap").as(
          "MinimapFloorNamePatch",
        );
        cy.get('[data-cy="floor-name-input"]').should("exist").click();
        cy.get('[data-cy="floor-name-input"]').type(" - test");
        cy.get("[class^='submit-update']").should("exist").click();
        cy.wait("@MinimapFloorNamePatch")
          .its("response.statusCode")
          .should("equal", 200);
      }
    });
    it(`Testing: Minimap Floor Tag update works`, () => {
      if (zone.floors) {
        cy.intercept("PATCH", "/api/site/*/sitemap").as("MinimapFloorTagPatch");
        cy.get('[data-cy="floor-tag-input"]').click();
        cy.get('[data-cy="floor-tag-input"]').clear();
        cy.get('[data-cy="floor-tag-input"]').type("test");
        cy.get("[class^='submit-update']").should("exist").click();
        cy.wait("@MinimapFloorTagPatch")
          .its("response.statusCode")
          .should("equal", 200);
      }
    });
    it(`Testing: Minimap Image update works`, () => {
      if (zone.floors) {
        cy.intercept("POST", "/api/site/*/minimap?floor=*").as(
          "MinimapImagePost",
        );
        cy.get('[id="select-image"]').selectFile(
          "cypress/fixtures/minimap_test.png",
          { force: true },
        );
        cy.get("[class^='submit-update']").should("exist").click();
        cy.wait("@MinimapImagePost")
          .its("response.statusCode")
          .should("equal", 200);
      }
    });
  });
});
