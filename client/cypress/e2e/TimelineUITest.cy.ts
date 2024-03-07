import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Timeline section with border less div UI", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: Timeline section div should not contain divider line <hr> ${zone.url}`, () => {
      if (zone.timeline) {
        cy.get("[class^='_timelineButton']").click({ force: true });
        cy.get("#drawer-container").should("exist");
        cy.get("[class*='_timeline_divider']").should("not.exist");
      }
    });

    it(`Testing: Timeline section should not contain box-shadow ${zone.url}`, () => {
      if (zone.timeline) {
        cy.get("[class*='MuiPaper-elevation0']")
          .should("exist")
          .each(($el) => {
            const style = window.getComputedStyle($el[0]);
            const boxShadow = style.boxShadow;
            expect(boxShadow).to.be.oneOf(["none", ""]);
          });
      }
    });
  });

  describe(`Test case: Visibility toggle of Timeline section UI`, () => {
    beforeEach(() => {
      cy.accessZone(zone);
      cy.intercept("GET", "/api/site/*/*/exists").as("getSiteExists");
      cy.intercept("GET", "/api/site/*/survey/details/*").as("getSiteDetails");
      cy.intercept("GET", "/api/site/*/emptyFloors").as("getEmptyFloors");
    });

    const checkTransformStyle = (
      element: JQuery<HTMLElement>,
      shouldBeNone: boolean,
    ) => {
      const style = window.getComputedStyle(element[0]);
      const { transform } = style;
      shouldBeNone
        ? expect(transform).to.be.equal("none")
        : expect(transform).to.not.be.equal("none");
    };

    it(`Testing: Timeline drawer should be hidden in initial page render`, () => {
      if (zone.timeline) {
        cy.wait("@getSiteExists").then(() => {
          cy.wait("@getSiteDetails").then(() => {
            cy.wait("@getEmptyFloors").then(() => {
              cy.get("#drawer-container")
                .should("exist")
                .parent()
                .then(($parent) => {
                  checkTransformStyle($parent, false);
                });
            });
          });
        });
      }
    });

    //todo: Timeline drawer toggle visibility after clicking timeline button action

    it("Testing: Timeline survey button fetches correct node survey when selected", () => {
      if (zone.timeline) {
        cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite?date=*").as(
          "getSurveyDate",
        );

        cy.wait("@getSiteExists").then(() => {
          cy.wait("@getSiteDetails").then(() => {
            cy.wait("@getEmptyFloors").then(() => {
              cy.wait("@getSurveyDate").then(() => {
                cy.get("[class^='_timelineButton']").click({ force: true });

                cy.get("[data-cy='month_button']").then(($elements) => {
                  const randomIndex = Math.floor(
                    Math.random() * $elements.length,
                  );

                  // Click on the randomly selected month button
                  cy.wrap($elements)
                    .eq(randomIndex)
                    .click()
                    .then(($button) => {
                      // Find the monthName_display within the clicked button
                      const expectedMonthYear = $button
                        .find("[data-cy='monthName_display']")
                        .text();

                      const [month, year] = expectedMonthYear.split(" ");
                      const monthNumber = new Date(`${month} 1`).getMonth() + 1;
                      const formattedDate = `${year}-${monthNumber
                        .toString()
                        .padStart(2, "0")}`; // Converts to "YYYY-MM"

                      cy.wait("@getSurveyDate").then((interception) => {
                        expect(interception.request.url).to.include(
                          formattedDate,
                        );

                        // Further assertions or checks can go here, such as verifying the UI state
                        cy.get("[class*='_timeline_selectedSurvey']").then(
                          ($title) => {
                            cy.get("[data-cy='Survey_Date']").then(($input) => {
                              expect($title.text()).to.include($input.text());
                            });
                          },
                        );
                      });
                    });
                });
              });
            });
          });
        });
      }
    });
  });
});
