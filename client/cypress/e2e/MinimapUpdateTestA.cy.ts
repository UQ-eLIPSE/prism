import { testEachZone } from "../testutils";
import { updateAndVerifyInput } from "../support/minimapUtils";

const floorSelect = '[data-testid="floor-select-0"]';
const floorNameInput = '[data-cy="floor-name-input"]';
const floorTagInput = '[data-cy="floor-tag-input"]';

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
        cy.get(floorSelect).should("exist").click();
        cy.wait(500);
        updateAndVerifyInput(floorNameInput, "fName", "@MinimapFloorNamePatch");
      }
    });
    it(`Testing: Minimap Floor Tag update works`, () => {
      if (zone.floors) {
        cy.intercept("PATCH", "/api/site/*/sitemap").as("MinimapFloorTagPatch");
        cy.get(floorSelect).should("exist").click();
        cy.wait(500);
        updateAndVerifyInput(floorTagInput, "A", "@MinimapFloorTagPatch");
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
        cy.get(".submit-update").should("exist").click();
        cy.wait("@MinimapImagePost")
          .its("response.statusCode")
          .should("equal", 200);
      }
    });
  });
});
