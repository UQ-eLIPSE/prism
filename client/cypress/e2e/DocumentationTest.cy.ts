// import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  //These test suites will remain inactive for the time being, as the functionality for uploading documentation through the UI is still under development and has been disabled.
  describe.skip("Test case:Documentation Test", () => {
    beforeEach(() => {
      cy.accessZone(zone);
      if (!zone.adminUser || !zone.documentation) return;
      cy.intercept("POST", "/api/documentation/*").as("DocumentationPost");
      cy.get("[data-cy='sb-documentation']").should("exist").click();
    });

    it(`Testing to check that Documentation handles a case where no file has been selected and submit button is clicked`, () => {
      if (!zone.adminUser || !zone.documentation) return;

      cy.get("[data-cy='submit-documentation']").should("exist").click();
      cy.on("window:alert", (str) => {
        expect(str).to.contains("Please select a file before submitting.");
      });
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
      cy.get("[data-cy='Documentation-button']").then((directoryList) => {
        const found = Cypress.$.makeArray(directoryList).some((directory) => {
          const name = Cypress.$(directory)
            .find("[data-cy='Documentation-name']")
            .text();
          return name.includes("Test");
        });
        expect(found).to.be.true;
      });
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

    it(`Testing to check that Documentation removes file selected once cancel is clicked`, () => {
      if (!zone.adminUser || !zone.documentation) return;
      cy.get("[data-cy='browse-computer']").selectFile(
        "cypress/fixtures/Test.zip",
        { force: true },
      );
      cy.get("[data-cy='cancel-documentation']").should("exist").click();
      cy.get("[data-cy='browse-computer']").then((input) => {
        const inputFileElement = input[0] as HTMLInputElement;
        if (inputFileElement.files) {
          expect(inputFileElement.files.length).to.eq(0);
        } else {
          throw new Error("The file input's files property is null.");
        }
      });
    });
  });
});
