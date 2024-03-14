import { testEachZone } from "../testutils";

// Helper function to check if DD/MM/YYYY date matches Month YYYY
// i.e. 01/01/2021 -> Jan 2021
function checkDateMatch(inputDate: string, expectedDate: string): boolean {
  const dateParts: string[] = inputDate.split("/");
  if (dateParts.length !== 3) return false;
  const dateObject = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);

  // dateObject.toLocaleString() => March -> Mar
  const convertedDate: string = `${dateObject.toLocaleString("default", {
    month: "short",
  })} ${dateObject.getFullYear()}`;

  return convertedDate === expectedDate;
}

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
    beforeEach(function () {
      cy.accessZone(zone);
      if (!zone.timeline) this.skip();
    });

    it(`Testing: Timeline drawer should be hidden in initial page render`, () => {
      cy.get("[data-cy='sb-home']").should("exist").click();

      cy.get('[data-cy="sb-site"]').should("exist").click();
      cy.get("#drawer-container").parent().should("exist").and("be.hidden");
    });

    it(`Testing: Timeline drawer should be visible when timeline button is clicked`, () => {
      cy.get('[data-cy= "timeline-button"]').click();
      cy.get("#drawer-container").parent().should("be.visible");
    });

    it("Testing: Timeline survey button fetches correct node survey when selected", () => {
      cy.intercept("GET", "/api/site/*/*/survey/minimapSingleSite?date=*").as(
        "getSurveyDate",
      );

      cy.get("[data-cy='month_button']").then(($elements) => {
        const randomIndex = Math.floor(Math.random() * $elements.length);

        // Click on the randomly selected month button
        cy.wrap($elements)
          .eq(randomIndex)
          .click({ force: true })
          .then(($button) => {
            // Find the monthName_display within the clicked button
            const expectedMonthYear = $button
              .find("[data-cy='monthName_display']")
              .text();

            const [month, year] = expectedMonthYear.split(" ");
            const monthNumber = new Date(`${month} 1`).getMonth() + 1;
            const formattedDate = `${year}-${monthNumber.toString().padStart(2, "0")}`; // Converts to "YYYY-MM"

            cy.wait("@getSurveyDate").then((interception) => {
              expect(interception.request.url).to.include(formattedDate);
            });
          });
      });
    });
  });
  describe(`Test case: UI renders expected values for each timeline survey`, () => {
    beforeEach(function () {
      cy.accessZone(zone);
      if (!zone.timeline) this.skip();
    });

    it(`Testing: Date title of selected survey should match date in survey node`, () => {
      cy.get("[class*='_timeline_selectedSurvey']").then(($title) => {
        cy.get("[data-cy='Survey_Date']").then(($input) => {
          expect($title.text()).to.include($input.text());
        });
      });
    });

    it(`Testing: Header of selected survey should match header in survey node`, () => {
      cy.get("[data-cy='Survey_Date']")
        .invoke("text")
        .then(($date) => {
          cy.get("[data-cy='Survey_Date']")
            .parent()
            .prev()
            .invoke("text")
            .should(($header) => {
              expect(checkDateMatch($date, $header)).to.be.true;
            });
        });
    });
  });
});
