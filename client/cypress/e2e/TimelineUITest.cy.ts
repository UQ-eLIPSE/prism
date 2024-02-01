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

    it(`Testing: Timeline drawer toggle visibility after clicking timeline button action`, () => {
      if (zone.timeline) {
        cy.wait("@getSiteExists").then(() => {
          cy.wait("@getSiteDetails").then(() => {
            cy.wait("@getEmptyFloors").then(() => {
              cy.get("[class^='_timelineButton']").click({ force: true });
              cy.get("#drawer-container")
                .should("exist")
                .parent()
                .then(($parent) => {
                  checkTransformStyle($parent, true);
                  cy.get("[class^='_timelineButton']").click({ force: true });
                  cy.get("#drawer-container")
                    .should("exist")
                    .parent()
                    .then(($parent) => {
                      checkTransformStyle($parent, false);
                    });
                });
            });
          });
        });
      }
    });
  });
});
