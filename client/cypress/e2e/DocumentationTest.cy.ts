import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case:Documentation Test", () => {
    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser || !zone.documentation) return;
      cy.intercept("POST", "/api/documentation/*").as("DocumentationPost");
      cy.get("[data-cy='sb-documentation']").should("exist").click();
    });

    it(`Testing to check that Documentation handles zip files and sends a patch request once submit is clicked`, () => {
      if (!zone.adminUser || !zone.documentation) return;
      cy.get("[data-cy='browse-computer']").selectFile(
        "cypress/fixtures/Test.zip",
        { force: true },
      );
      cy.get("[data-cy='submit-documentation']").should("exist").click();
      cy.wait("@DocumentationPost")
        .its("response.statusCode")
        .should("equal", 200);
    });

    it(`Testing to check that Documentation handles a non zip file and sends an alert once submit is clicked`, () => {
      if (!zone.adminUser || !zone.documentation) return;
      cy.get("[data-cy='browse-computer']").selectFile(
        "cypress/fixtures/Test.txt",
        { force: true },
      );
      cy.on("window:alert", (str) => {
        expect(str).to.contains("Please select a ZIP file.");
      });
    });
  });
});
