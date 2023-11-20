import { testEachZone } from "../testutils";

describe("Test case: Timeline section with border less div UI", () => {
  testEachZone((zone: string) => {
    it(`Testing:  Timeline section div should not contain divider line <hr>`, () => {
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
        cy.get("[class^='_timelineButton']").click();
        cy.get("[class^='MuiDivider-root _timeline_divider']").should(
          "not.exist"
        );
      }
    });
    it(`Testing:  Timeline section should not contain box-shadow`, () => {
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
        cy.get("[class*='MuiPaper-elevation1']").each(($el) => {
          const style = window.getComputedStyle($el[0]);
          const boxShadow = style.boxShadow;
          expect(boxShadow).to.be.oneOf(["none", ""]);
        });
      }
    });
  });
});
