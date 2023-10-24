describe("Facility title should be dynamic and visible on main page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Facility title should be present on the main page", () => {
    cy.get("[data-cy=facility-name]").should("exist");
  });
});

export {};
