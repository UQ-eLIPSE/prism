Cypress.Commands.add("accessZone", (zone: Cypress.PrismZone): void => {
  const test = Cypress.env("testurl");
  console.log(test);
  if (zone.singleSite) {
    if (test === "local") {
      cy.visit(`${zone.url.local}/site`);
    } else if (test === "UAT") {
      cy.visit(zone.url.uat);
    }
  } else {
    if (test === "local") {
      cy.visit(zone.url.local);
    } else if (test === "UAT") {
      cy.visit(zone.url.uat);
    }

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
