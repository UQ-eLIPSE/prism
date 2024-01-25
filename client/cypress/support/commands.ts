Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  if (zone.singleSite) {
    cy.visit(`${zone.url}/site`);
  } else {
    cy.visit(zone.url);
    cy.get(".pin.enabled.enabled.false.bottom.enabled").click({
      force: true,
    });
    if(zone.adminUser){
      cy.contains('Go to Site').click({
        force: true,
      });    
    }
  }
});
