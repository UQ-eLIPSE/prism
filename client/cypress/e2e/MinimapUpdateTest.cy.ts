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
        cy.get('[data-testid="floor-select-0"').should("exist").click();
        cy.get('[data-cy="floor-name-input"]').should("exist").click();
        cy.get('[data-cy="floor-name-input"]').clear().type("fName");
        cy.get("[class^='submit-update']").should("exist").click();
        cy.wait("@MinimapFloorNamePatch");
        // .its("response.statusCode")
        // .should("equal", 200);
        cy.get('[data-testid="floor-select-0"').should("exist").click();
        cy.get('[data-cy="floor-name-input"]')
          .invoke("val")
          .then((val) => {
            expect(val).to.equal("fName");
          });
      }
    });
    it(`Testing: Minimap Floor Tag update works`, () => {
      if (zone.floors) {
        cy.intercept("PATCH", "/api/site/*/sitemap").as("MinimapFloorTagPatch");
        cy.get('[data-testid="floor-select-0"').should("exist").click();
        cy.get('[data-cy="floor-tag-input"]').click().clear().type("Tag");
        cy.get("[class^='submit-update']").should("exist").click();
        cy.wait("@MinimapFloorTagPatch");
        cy.get('[data-testid="floor-select-0"').should("exist").click();
        cy.get('[data-cy="floor-tag-input"]')
          .invoke("val")
          .then((val) => {
            expect(val).to.equal("Tag");
          });
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

  describe("Test case: Minimap UI update works as intended", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: Save button should be hidden at initial render`, () => {
      cy.get("[class^='submit-update']").should("not.exist");
    });

    it(`Testing: Save button should not appear if name or tag value didn't change`, () => {
      if (!zone.floors) return;
      cy.get('[data-cy="floor-name-input"]').click();
      cy.get('[data-cy="floor-name-input"]')
        .invoke("val")
        .then((val) => {
          cy.get('[data-cy="floor-name-input"]').clear();
          if (val !== "") {
            cy.get('[data-cy="floor-name-input"]').type(val as string);
          }
          cy.get("[class^='submit-update']").should("not.exist");
        });

      cy.get('[data-cy="floor-tag-input"]')
        .invoke("val")
        .then((val) => {
          cy.get('[data-cy="floor-tag-input"]').click().clear();
          if (val !== "") {
            cy.get('[data-cy="floor-tag-input"]').type(val as string);
          }

          cy.get("[class^='submit-update']").should("not.exist");
        });
    });

    it(`Alert should be shown if user tries to submit empty tag`, () => {
      if (!zone.floors) return;
      cy.intercept("PATCH", "/api/site/*/sitemap").as("MinimapFloorNamePatch");

      // Need to type and submit first before checking if submitting with
      // empty tag will show an alert
      cy.get('[data-testid="floor-select-0"').should("exist").click();
      cy.get('[data-cy="floor-tag-input"]').click().clear().type("TageA");
      cy.get("[class^='submit-update']").should("exist").click();
      cy.wait("@MinimapFloorNamePatch").then(() => {
        cy.get('[data-cy="floor-tag-input"]').click().clear();
        cy.get("[class^='submit-update']").should("exist").click();
        cy.on("uncaught:exception", (err) => {
          expect(err.message).to.include("Failed to Update Floor Details");
          return false; // prevent the test from failing
        });
        cy.on("window:alert", (str) => {
          expect(str).to.contains("Failed to Update Floor Details");
        });
        cy.wait("@MinimapFloorNamePatch")
          .its("response.statusCode")
          .should("eq", 400);
      });
    });

    it(`Testing: Alert should be shown if user tries to submit empty name`, () => {
      if (!zone.floors) return;
      cy.intercept("PATCH", "/api/site/*/sitemap").as("MinimapFloorNamePatch");

      // Need to type and submit first before checking if submitting with
      // empty tag will show an alert
      cy.get('[data-testid="floor-select-0"').should("exist").click();
      cy.get('[data-cy="floor-name-input"]').click().clear().type("fNameA");
      cy.get("[class^='submit-update']").should("exist").click();
      cy.wait("@MinimapFloorNamePatch").then(() => {
        cy.get('[data-cy="floor-name-input"]').click().clear();
        cy.get("[class^='submit-update']").should("exist").click();
        cy.on("uncaught:exception", (err) => {
          expect(err.message).to.include("Failed to Update Floor Details");
          return false; // prevent the test from failing
        });
        cy.on("window:alert", (str) => {
          expect(str).to.contains("Failed to Update Floor Details");
        });
        cy.wait("@MinimapFloorNamePatch")
          .its("response.statusCode")
          .should("eq", 400);
      });
    });
  });
});
