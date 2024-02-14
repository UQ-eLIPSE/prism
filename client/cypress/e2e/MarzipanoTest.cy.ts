import { testEachZone } from "../testutils";

function checkStyleContains(styleString: string) {
  cy.get("[data-cy='selected-node']")
    .parent()
    .should("have.attr", "style")
    .should("contain", styleString);
}

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Marzipano node configuration when traversing between different floors", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: New Marzipano should be created`, () => {
      if (!zone.floors) return;
      cy.get("#pano").find("canvas").should("exist");
    });

    it(`Testing: Changing view rotation should also change the style of the selected node`, () => {
      if (!zone.floors) return;

      cy.get("[data-cy='selected-node'")
        .parent()
        .invoke("attr", "style")
        .then((originalStyleValue) => {
          expect(originalStyleValue).to.contain("transform");
          cy.window()
            .its("viewer")
            .then((viewer) => {
              // You can interact with the viewer instance here
              expect(viewer.view).to.exist;

              // Invoke an event on the viewer
              // viewer.lookTo({ _yaw: 2, _pitch: 2, _fov: 2 });
              viewer.view._yaw = 2;
              viewer.view._pitch = 2;
              viewer.view._fov = 2;
              cy.get("[data-cy='selected-node']")
                .parent()
                .invoke("attr", "style")
                .then((newStyleValue) => {
                  expect(newStyleValue).to.not.equal(originalStyleValue);
                }); //* NOT WORKINGG

              // Move floors
              cy.get(".levelSliderContainer").then(($levelSliderContainer) => {
                const $labels = $levelSliderContainer.find("div > label");
                const $checkedLabel = $labels.filter(".checked");
                const $uncheckedLabels = $labels.not(".checked");
                if (!$uncheckedLabels.length) return;
                $checkedLabel.removeClass("checked");
                const $randomLabel = $uncheckedLabels.eq(
                  Math.floor(Math.random() * $uncheckedLabels.length),
                );
                $randomLabel.addClass("checked");
                ($randomLabel[0] as HTMLElement).click();
              });
            });
        });
    });

    it(`Testing: Rotation of the node should be consistent when traversing between different floors`, () => {
      if (!zone.floors) return;

      cy.get("[data-cy='selected-node']")
        .parent()
        .invoke("attr", "style")
        .then((originalStyleValue) => {
          expect(originalStyleValue).to.contain("transform");
          cy.get(".levelSliderContainer").then(($levelSliderContainer) => {
            // Find all the labels inside the .levelSliderContainer element
            const $labels = $levelSliderContainer.find("div > label");

            // Find the label with the .checked class
            const $checkedLabel = $labels.filter(".checked");

            // Filter out the checked label from the list of labels
            const $uncheckedLabels = $labels.not(".checked");

            if (!$uncheckedLabels.length) return;
            // Remove the .checked class from the currently checked label
            $checkedLabel.removeClass("checked");

            // Add the .checked class to a random unchecked label
            const $randomLabel = $uncheckedLabels.eq(
              Math.floor(Math.random() * $uncheckedLabels.length),
            );
            $randomLabel.addClass("checked");
            ($randomLabel[0] as HTMLElement).click();

            cy.get("[data-cy='selected-node']")
              .parent()
              .invoke("attr", "style")
              .then((newStyleValue) => {
                expect(newStyleValue).to.equal(originalStyleValue);
              });
          });
        });
    });
  });
});
