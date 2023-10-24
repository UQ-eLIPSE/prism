import skipTest from "@cypress/skip-test";

describe("Media page is accessable scales and displays hotspots", () => {
  beforeEach(() => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_MEDIA") !== "true");
    cy.visit("/");
    cy.get("[data-cy=media-link]").should("exist").click();
  });

  it("Search field should be clearable", () => {
    cy.get("input.MuiInputBase-input").type("This is a test");
    cy.get(".MuiInputAdornment-root>Button.MuiButtonBase-root").click();
    cy.get(".MuiInputBase-input").should("be.empty");
  });

  it("List should have 5 items", () => {
    cy.get("tbody.MuiTableBody-root")
      .find("tr.MuiTableRow-root")
      .should("have.length", 5);
  });

  it("Display item count should display that amount of items", () => {
    cy.get(".MuiTablePagination-selectRoot").click();
    cy.get("ul.MuiMenu-list li").eq(1).click();
    cy.get("tbody.MuiTableBody-root")
      .find("tr.MuiTableRow-root")
      .should("have.length", 10);
  });
});

export {};
