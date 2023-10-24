import skipTest from "@cypress/skip-test";

describe("SideNav links to correct locations", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy=sb]").should("exist");
  });

  it("media link goes to media page", () => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_MEDIA") !== "true");

    cy.get("[data-cy=sb-media]").click();
    cy.url().should("eq", "http://localhost:3000/media");
  });

  it("faq link goes to faq page", () => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_FAQ") !== "true");

    cy.get("[data-cy=sb-faq]").click();
    cy.url().should("eq", "http://localhost:3000/faq");
  });

  it("client logo links to home page", () => {
    cy.get("[data-cy=sb-company-logo]").click();
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("documentation link to documentation page", () => {
    cy.get("[data-cy=sb-documentation]").click();
    cy.url().should("eq", "http://localhost:3000/documentation");
  });

  it("site link to site page", () => {
    cy.get("[data-cy=sb-site]").click();
    cy.url().should("eq", "http://localhost:3000/site");
  });

  it("home link to gome page", () => {
    cy.get("[data-cy=sb-home]").click();
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("prism logo links to eLIPSE website", () => {
    cy.get("[data-cy=sb-elipse-logo]").should(
      "have.attr",
      "href",
      "https://www.elipse.uq.edu.au/",
    );
  });

  it("side nav should expand and then collapse", () => {
    skipTest.skipOn(
      Cypress.env("REACT_APP_ENABLE_MEDIA") !== "true" ||
        Cypress.env("REACT_APP_ENABLE_FAQ") !== "true",
    );
    cy.get("[data-cy=sidenav-toggle]").click();
    cy.get(".drawer-opened").should("exist");
    cy.get("[data-cy=sidenav-toggle]").click();
    cy.get(".drawer-closed").should("exist");
  });
});

export {};
