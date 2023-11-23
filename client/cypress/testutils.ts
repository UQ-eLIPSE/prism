// Function to test each zone with proper TypeScript annotations
const testEachZone = (testFn: (zone: Cypress.PrismZone) => void): void => {
  const allZones: Cypress.PrismZone[] = Cypress.env("deployedZones");

  allZones.forEach((zone: Cypress.PrismZone) => {
    testFn(zone);
  });
};

const performChecks = () => {
  cy.get(".hotspot.link-hotspot").then(
    ($result: JQuery<HTMLElement>) => {
        const filtered = $result.filter((index, element) => {
          const $element = Cypress.$(element);
          const grandparent = $element.parent().parent();
          return grandparent.css("display") === "block";
        });

        if (filtered.length <= 0) {
          return;
        } else {
          cy.wrap(filtered)
            .find(".hotspot-tooltip")
            .then(($collection1: JQuery<HTMLElement>) => {
              const htmlCollection1 = $collection1
                .map((index, html) => html.innerHTML)
                .get();
              cy.get(".linkButton")
                .should("exist")
                .then(($linkButton) => {
                  if (
                    $linkButton.find(".fas.fa-chevron-up").length === 0
                  ) {
                    cy.wrap($linkButton).click();
                  } else {
                    cy.log(
                      "The .linkButton contains the .fas.fa-chevron-up icon, not clicking."
                    );
                  }
                });

              cy.get(".linkNodeNames")
                .should("exist")
                .then(($collection2) => {
                  const htmlCollection2 = $collection2
                    .map((index, html) => html.textContent ?? "")
                    .get();
                  expect(
                    htmlCollection1.length,
                    "Both collections should have the same number of elements"
                  ).to.equal(htmlCollection2.length);
                  htmlCollection1.forEach((html, index) => {
                    expect(html.trim()).to.equal(
                      htmlCollection2[index].trim(),
                      `HTML content of element ${index} should match`
                    );
                  });
                });
            });
        }
    }
  );
}

export { testEachZone, performChecks };

