Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  if (zone.singleSite) {
    cy.visit(`${zone.url}/site`);
    cy.wait(1000);
  } else {
    cy.visit(zone.url);
    // TODO: aiming remove all cy.wait, at this stage it is necessary to keep it
    cy.wait(1000);
    cy.get(".pin.enabled.enabled.false.bottom.enabled").click({
      force: true,
    });
  }
});
