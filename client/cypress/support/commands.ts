Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  const test = Cypress.env("testurl");
  if (zone.singleSite) {
    cy.visit(
      test === "local" ? `${zone.url.local}/site` : `${zone.url.uat}/site`,
    );
  } else {
    cy.visit(test === "local" ? zone.url.local : zone.url.uat);
    cy.get(".pin.enabled.enabled.false.bottom.enabled").click({
      force: true,
    });
    if (zone.adminUser) {
      cy.contains("Go to Site").click({
        force: true,
      });
    }
  }
});
