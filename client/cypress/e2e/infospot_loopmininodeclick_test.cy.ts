import { testEachZone } from "../testutils";

/*
Feature: LinkNode Information Consistency
As a user
I want to see consistent information in the 3D view and expanded left top bar
So that I can trust the data displayed is accurate

Scenario: Verify information consistency between hotspot tooltip and linkNode in 3D view
Given I am logged into the application
If: 
It is a multi sites application,
And I click a map-pin with unique ID
Then I should navigate to a single site 3D view page
And I click on each mininode on current minimap
Then I should see a scene with one or more hotspot with displayed information matching information in the expanded left top bar
Else:
When I navigate to the 3D view page
And I click on each mininode on current minimap
Then I should see a scene with one or more hotspot with displayed information matching information in the expanded left top bar
*/

describe("Verify that when a user clicks all nodes on the minimap, application correctly populates the top-left-div with a list that matches the names of the hotspots present in the current scene", () => {
  testEachZone((zone: string) => {
    it("Testing: ${zone}, clicks each mininode element and then compares", () => {
      //check multisites or singlesite
      cy.visit(zone);
      //get Project title
      cy.get("h1").then(($h1) => {
        const text = $h1.text();
        switch (text) {
          case "AGCO360":
            cy.get("#623971b5f0861184d7de5ba4").click({ force: true });
            break;
          case "":
            cy.visit(`${zone}/site`);
            break;
          default:
            cy.visit(`${zone}/site`);
        }
      });
      // Visit the page where the elements exist
      // Get all elements with the class '.someclass'
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
                  return (
                    // $element.css("display") === "block" &&
                    grandparent.css("display") === "block"
                  );
                });

                if (filtered.length <= 0) {
                  return;
                } else {
                  cy.wrap(filtered)
                    .find(".hotspot-tooltip")
                    .then(($collection1: JQuery<HTMLElement>) => {
                      // Map through each .hotspot-tooltip and get their inner HTML content
                      const htmlCollection1 = $collection1
                        .map((index, html) => html.innerHTML)
                        .get();
                      // Retrieve the collection 2 of elements with .linkNodeNames
                      //   cy.get(".linkButton").should("exist").click();
                      cy.get(".linkButton")
                        .should("exist")
                        .then(($linkButton) => {
                          // Check if the .linkButton contains an icon with the class 'fas fa-chevron-up'
                          if (
                            $linkButton.find(".fas.fa-chevron-up").length === 0
                          ) {
                            // If it does not contain the icon, click the button
                            cy.wrap($linkButton).click();
                          } else {
                            // If it contains the icon, log a message and do not click
                            cy.log(
                              "The .linkButton contains the .fas.fa-chevron-up icon, not clicking.",
                            );
                          }
                        });

                      cy.get(".linkNodeNames")
                        .should("exist")
                        .then(($collection2) => {
                          // Map through each element in collection2 and get their inner HTML content
                          const htmlCollection2 = $collection2
                            .map((index, html) => html.textContent ?? "")
                            .get();
                          // Comparing the length of both collections
                          expect(
                            htmlCollection1.length,
                            "Both collections should have the same number of elements",
                          ).to.equal(htmlCollection2.length);

                          // Continue with comparison content
                          htmlCollection1.forEach((html, index) => {
                            try {
                              expect(html.trim()).to.equal(
                                htmlCollection2[index].trim(),
                                `HTML content of element ${index} should match`,
                              );
                            } catch (e) {
                              console.error(`Error in element ${index}:`, e);
                              console.log(
                                `Collection1 Element ${index} HTML: ${htmlCollection1[index]}`,
                              );
                              console.log(
                                `Collection2 Element ${index} HTML: ${htmlCollection2[index]}`,
                              );
                              throw e; // rethrow the error so Cypress knows the test failed
                            }
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
