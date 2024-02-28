Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  const test = Cypress.env("testurl");
  if (zone.singleSite) {
    cy.visit(
      test === "local" ? `${zone.url.local}/site` : `${zone.url.uat}/site`,
    );
  } else {
    cy.visit(test === "local" ? zone.url.local : zone.url.uat);
    // TODO: to discuss whether implement choose all map-pin needed or choose a random one can be satisfied for the test
    cy.get(".pin.enabled.enabled.false.bottom.enabled")
      .should("have.length.gte", 1)
      .then(($div) => {
        const items = $div.toArray();
        return Cypress._.sample(items);
      })
      .click({ force: true });
    if (zone.adminUser) {
      cy.contains("Go to Site").click({
        force: true,
      });
    }
  }
});
