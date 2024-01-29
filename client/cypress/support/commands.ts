Cypress.Commands.add("accessZone", (): void => {
  const projectName = Cypress.env("projectName");
  const projects = Cypress.env("deployedZones") as Cypress.PrismZone[];
  const zone = projects.find(
    (p: Cypress.PrismZone) => p.project === projectName,
  );
  if (!zone) {
    throw new Error(`Project not found: ${zone}`);
  }

  if (zone.singleSite) {
    cy.visit(`${zone.url}/site`);
  } else {
    cy.visit(zone.url);
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
