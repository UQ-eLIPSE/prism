Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  const test = Cypress.env("testurl");
  if (zone.singleSite) {
    cy.visit(
      test === "local" ? `${zone.url.local}/site` : `${zone.url.uat}/site`,
    );
  } else {
    cy.visit(test === "local" ? zone.url.local : zone.url.uat);
    // TODO: to discuss whether implement choose any/all map-pin needed or choose a default one can be satisfied for the test
    cy.get(".pin.enabled.enabled.false.bottom.enabled").eq(0).click({
      force: true,
    });
    if (zone.adminUser) {
      cy.contains("Go to Site").click({
        force: true,
      });
    }
  }
});
