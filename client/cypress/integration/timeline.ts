import skipTest from "@cypress/skip-test";

describe("Timeline should toggle and display surveys if turned on", () => {
  beforeEach(() => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_TIMELINE") !== "true");
    cy.visit("/");
  });

  it("Timeline button should always be visible", () => {
    cy.get("[data-cy=timeline-button]").should("exist");
    cy.get("[data-cy=timeline-button]").click();
    cy.get("[data-cy=timeline-button]").should("exist");
  });

  it("Timeline button should toggle drawer visibility", () => {
    cy.get("[data-cy=timeline-button]").click();
    cy.get("[data-cy=timeline-drawer-container]").should("exist");
    cy.get("[data-cy=timeline-drawer-container]")
      .should("have.css", "visibility")
      .and("match", /visible/);
    cy.get("[data-cy=timeline-button]").click();
    cy.get("[data-cy=timeline-drawer-container]")
      .should("have.css", "visibility")
      .and("match", /hidden/);
  });

  it("Clicking on a survey should select it", () => {
    cy.get("[data-cy=timeline-button]").click();
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy]")
      .eq(0)
      .click();
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy]")
      .eq(0)
      .should("have.attr", "data-cy")
      .should("eq", "timeline-selected-survey");
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy=timeline-selected-survey]")
      .should("have.length", 1);
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy]")
      .eq(1)
      .click();
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy]")
      .eq(1)
      .should("have.attr", "data-cy")
      .should("eq", "timeline-selected-survey");
    cy.get("[data-cy=timeline-drawer-container]")
      .find("[data-cy=timeline-selected-survey]")
      .should("have.length", 1);
  });
});

describe("Timeline and timeline button should not be visible if turned off", () => {
  beforeEach(() => {
    skipTest.skipOn(Cypress.env("REACT_APP_ENABLE_TIMELINE") === "true");
    cy.visit("/");
  });

  it("Timeline button should not be visible", () => {
    cy.get("[data-cy=timeline-button]").should("not.exist");
  });

  it("Timeline should not be visible", () => {
    cy.get("[data-cy=timeline-drawer-container]").should("not.exist");
  });
});

export {};
