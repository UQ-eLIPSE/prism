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
Then I should see a hotspot with displayed information in this scene matching information in the expanded left top bar
Else:
When I navigate to the single 3D view page
Then I should see a hotspot with displayed information in this scene matching information in the expanded left top bar
*/

describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
  testEachZone((zone: string) => {
    it(`Testing: ${zone}, should compare elements with .hotspot-tooltip and .linkNodeNames`, () => {
      // Visit the page where your divs are located
      cy.visit(zone);
      cy.get("h1").then(($h1) => {
        const text = $h1.text();
        switch (text) {
          case "AGCO360":
            cy.log("multi");
            cy.get("#623971b5f0861184d7de5ba4").click({ force: true });
            performChecks();
            break;
          case "":
            cy.log("single");
            cy.visit(`${zone}/site`);
            performChecks();
            break;
          default:
            cy.log("single");
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
                  // Map through each .hotspot-tooltip and get their inner HTML content
                  const htmlCollection1 = $collection1
                    .map((index, html) => html.innerHTML)
                    .get();
                  // Retrieve the collection 2 of elements with .linkNodeNames
                  cy.get(".linkButton").should("exist").click();
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
});
