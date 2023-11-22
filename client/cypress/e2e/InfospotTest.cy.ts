// import { testEachZone } from "../testutils";

describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
  // testEachZone((zone: string) => {
  it(`Testing in each Zone: should compare elements with .hotspot-tooltip and .linkNodeNames`, () => {
    cy.testEachZone((zone) => {
      cy.visit(zone);
      // TODO: aiming remove cy.wait, at this stage it is necessary to keep it for the if block
      cy.wait(1000);
      cy.get(".mainApp")
        .should("be.visible")
        .then(($mainApp) => {
          if ($mainApp.find(".sitehome-container").length > 0) {
            cy.get(".pin.enabled.enabled.false.bottom.enabled").click({
              force: true,
            });
            performChecks();
          } else {
            cy.visit(`${zone}/site`);
            performChecks();
          }
        });

      function performChecks() {
        cy.get("body").then(($body) => {
          if ($body.find(".linkButton.disabled").length > 0) {
            return;
          } else {
            if ($body.find(".hotspot.link-hotspot").length > 0) {
              cy.get(".hotspot.link-hotspot")
                .filter((index, element) => {
                  // Filter those elements based on a condition
                  return Cypress.$(element).css("display") === "block";
                })
                .should("exist")
                .find(".hotspot-tooltip")
                .then(($collection1) => {
                  const htmlCollection1 = $collection1
                    .map((index, html) => html.innerHTML)
                    .get();
                  cy.get(".linkButton").should("exist").click();
                  cy.get(".linkNodeNames")
                    .should("exist")
                    .then(($collection2) => {
                      const htmlCollection2 = $collection2
                        .map((index, html) => html.textContent ?? "")
                        .get();

                      // Test: Comparing the length of both collections
                      expect(
                        htmlCollection1.length,
                        "Both collections should have the same number of elements",
                      ).to.equal(htmlCollection2.length);

                      // Test: Continue with comparison content
                      htmlCollection1.forEach((html, index) => {
                        expect(html.trim()).to.equal(
                          htmlCollection2[index].trim(),
                          `HTML content of element ${index} should match`,
                        );
                      });
                    });
                });
            } else {
              return;
            }
          }
        });
      }
    });
    });
  it("Testing in each Zone: clicks each mininode element and then compares", () => {
    cy.testEachZone((zone) => { 

    
      cy.visit(zone);
      cy.wait(1000);
      cy.get(".mainApp")
        .should("be.visible")
        .then(($mainApp) => {
          if ($mainApp.find(".sitehome-container").length > 0) {
            cy.get(".pin.enabled.enabled.false.bottom.enabled").click({
              force: true,
            });
          } else {
            cy.visit(`${zone}/site`);
          }
        });

      cy.get("[class^='_minimap_node']").then(($elements) => {
        $elements.each((index, element) => {
          cy.wrap(element)
            .click({ force: true })
            .then(() => {
              cy.get("body").then(($body) => {
                if ($body.find(".linkButton.disabled").length > 0) {
                  return;
                } else {
                  if ($body.find(".hotspot.link-hotspot").length > 0) {
                    performChecks();
                  } else {
                    return;
                  }
                }
              });
            });
        });

        function performChecks() {
          cy.get(".hotspot.link-hotspot").then(
            ($result: JQuery<HTMLElement>) => {
              if ($result.length > 0) {
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
                              "The .linkButton contains the .fas.fa-chevron-up icon, not clicking.",
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
                            "Both collections should have the same number of elements",
                          ).to.equal(htmlCollection2.length);
                          htmlCollection1.forEach((html, index) => {
                            expect(html.trim()).to.equal(
                              htmlCollection2[index].trim(),
                              `HTML content of element ${index} should match`,
                            );
                          });
                        });
                    });
                }
              } else {
                cy.log(
                  "No .hotspot.link-hotspot elements found, skipping checks.",
                );
                return;
              }
            },
          );
        }
      });
    });
  });
});
