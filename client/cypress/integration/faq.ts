import skipTest from "@cypress/skip-test";

describe("Faq page is accessible and questions expand to reveal answers", () => {
  beforeEach(() => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_FAQ") !== "true");
    cy.visit("/");
    cy.get("[data-cy=faq-link").should("exist").click();
  });

  it("Questions should expand and collapse on click to reveal answers", () => {
    cy.get("[data-cy=accordion-item]").should("exist").eq(0).click();
    cy.get(".MuiCollapse-entered").should("exist");
    cy.get("[data-cy=accordion-item]").should("exist").eq(0).click();
    cy.get(".MuiCollapse-hidden").should("exist");
  });
});

export {};
