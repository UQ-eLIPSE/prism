import { testEachZone } from "../testutils";

interface FileTypes {
  zip?: boolean;
  csv?: boolean;
}

function uploadFileHelper(include: FileTypes) {
  if (include.zip) {
    cy.get("#uploadZip").selectFile("cypress/fixtures/prism_new_field.zip", {
      force: true,
    });
  }
  if (include.csv) {
    cy.get("#uploadCSV").selectFile("cypress/fixtures/prism_new_field.csv", {
      force: true,
    });
  }
}

testEachZone((zone: Cypress.PrismZone) => {
  const url =
    Cypress.env("testurl") === "local" ? zone.url.local : zone.url.uat;
  describe(`Test case: Rendering of UI exists when navigated to ${url}`, () => {
    beforeEach(function () {
      cy.accessZone(zone);
    });

    it(`Testing: Navigating to Add Scene button exists`, () => {
      cy.get("[data-cy='sb-addScene']").should("exist");
    });

    it(`Testing: Page exists when navigated to addScene page`, () => {
      cy.get("[data-cy='sb-addScene']").should("exist").click();
      cy.get(".site-title").should("exist");
      cy.get(".upload").should("exist");
    });

    it(`Testing: Upload marzipano zip and csv input should exist within page`, () => {
      cy.get("#uploadZip").should("exist");
      cy.get("#uploadCSV").should("exist");
    });

    it(`Testing: Labels and Icons for upload Marzipano zip and csv should exist`, () => {
      cy.get("i.uploadIcons.fa-file-zipper")
        .should("exist")
        .next()
        .should("exist")
        .should("have.text", "Upload Marzipano ZIP");

      cy.get("i.uploadIcons.fa-file-csv")
        .should("exist")
        .next()
        .should("exist")
        .should("have.text", "Upload CSV File");
    });
  });

  describe(`Test case: Upload functionality of Marzipano zip and csv`, () => {
    beforeEach(function () {
      cy.accessZone(zone);
      cy.get("[data-cy='sb-addScene']").should("exist").click();
    });

    it(`Testing: Upload button should be disabled when no zip or CSV file is selected`, () => {
      cy.get(".submitBtn.formBtn.disabled").should("exist");
    });

    it(`Testing: upload functionality of Marzipano zip`, () => {
      cy.get("p.fileSize").should("exist").invoke("text").should("be.empty");

      uploadFileHelper({ zip: true });

      cy.get("p.fileSize")
        .should("exist")
        .invoke("text")
        .should("not.be.empty");

      cy.get("i.fa-file-zipper")
        .next()
        .should("have.text", "prism_new_field.zip");
    });

    it(`Testing: upload functionality of CSV file`, () => {
      cy.get("p.fileSize").should("exist").invoke("text").should("be.empty");

      uploadFileHelper({ csv: true });
      cy.get("p.fileSize")
        .should("exist")
        .invoke("text")
        .should("not.be.empty");

      cy.get("i.fa-file-csv").next().should("have.text", "prism_new_field.csv");
    });

    it(`Testing: Table renders when both zip and csv file are uploaded. Button should also be enabled`, () => {
      uploadFileHelper({ zip: true, csv: true });

      cy.get(".validationTable").should("exist");
      cy.get("table.scene_properties").should("exist");

      cy.get(".submitBtn.formBtn")
        .should("exist")
        .and("not.have.class", "disabled");
    });

    it(`Testing: Upon clicking submit after uploading files, it should navigate to site page`, () => {
      cy.intercept("POST", "/api/site/*/*/addScenes").as("addScenes");
      uploadFileHelper({ zip: true, csv: true });

      cy.get(".submitBtn.formBtn").click({ force: true });

      cy.wait("@addScenes").its("response.statusCode").should("equal", 200);

      cy.url().should("include", "/site");
    });
  });

  describe(`Test case: Delete functionality of already uploaded Marzipano zip and csv`, () => {
    beforeEach(() => {
      cy.accessZone(zone);
      cy.get("[data-cy='sb-addScene']").should("exist").click();
      uploadFileHelper({ zip: true, csv: true });
    });

    it(`Testing: Pressing delete button resets uploaded files`, () => {
      cy.get("label.cancelCross").click({ force: true, multiple: true });
      cy.get("i.fa-file-zipper")
        .next()
        .should("have.text", "Upload Marzipano ZIP");

      cy.get("i.fa-file-csv").next().should("have.text", "Upload CSV File");
    });
  });
});
