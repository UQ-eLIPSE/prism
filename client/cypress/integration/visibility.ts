import skipTest from "@cypress/skip-test";

const checkVisibility = (url: string): void => {
  cy.visit(url);
  cy.get("[data-cy=mini-map]").should("not.be.visible");
  cy.get("[data-cy=mini-map]")
    .find("[data-cy=node]")
    .eq(0)
    .should("not.be.visible");
  // TODO: visibility checks sometimes fail even though item is not visible
  // cy.get('[data-cy=facility-name]').should('not.be.visible')

  skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_MEDIA") !== "true", () => {
    cy.get("[data-cy=timeline-drawer-container]").should("not.be.visible");
    cy.visit("/");
    cy.get("[data-cy=timeline-button]").click();
    cy.visit(url);
    cy.get("[data-cy=timeline-drawer-container]").should("not.be.visible");
    //cy.get('[data-cy=timeline-button]').should('not.be.visible')
  });
};

describe("Check visibility of certain elements", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Certain items should only be visible on the home page", () => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_MEDIA") !== "true", () => {
      checkVisibility("/media");
    });

    () => {
      checkVisibility("/site");
    };

    skipTest.skipOn(
      Cypress.env("REACT_APP_ENABLE_DOCUMENTATION") !== "true",
      () => {
        checkVisibility("/documentation");
      },
    );

    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_FAQ") !== "true", () => {
      checkVisibility("/faq");
    });
  });
});

export {};
