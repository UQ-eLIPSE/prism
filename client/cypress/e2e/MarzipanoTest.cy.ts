import { Position } from "cypress-real-events/getCypressElementCoordinates";
import { testEachZone } from "../testutils";
import "cypress-real-events";

const changeToRandomFloor = ($container: JQuery<HTMLElement>) => {
  const $labels = $container.find("div > label");
  const $checkedLabel = $labels.filter(".checked");
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
};

const moveMarzipanoViewer = (
  id: string,
  movement: { x: number; y: number; fromPosition?: Position },
) => {
  const { x, y, fromPosition } = movement;
  cy.get(id)
    .realMouseDown()
    .realMouseMove(x, y, { position: fromPosition })
    .realMouseUp();
};

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: Marzipano node configuration when traversing between different floors", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: View parameters should remain consistent when trasversing through floors after moving marzipano`, () => {
      if (!zone.floors) return;

      moveMarzipanoViewer("#pano", { x: -250, y: 0, fromPosition: "center" });

      cy.get("[data-cy='selected-node']")
        .parent()
        .invoke("attr", "style")
        .then((originalStyleValue) => {
          expect(originalStyleValue).to.contain("transform");
          const transformIdx = originalStyleValue?.indexOf("transform:");
          const originalTransformValue =
            transformIdx !== -1
              ? originalStyleValue?.slice(transformIdx)
              : originalStyleValue;

          cy.get(".levelSliderContainer").then(($levelSliderContainer) => {
            changeToRandomFloor($levelSliderContainer);

            cy.get("[data-cy='selected-node']")
              .parent()
              .invoke("attr", "style")
              .then((newStyleValue) => {
                expect(newStyleValue).to.contain("transform:");
                const newTransformIdx = newStyleValue?.indexOf("transform");
                const newTransformValue =
                  newTransformIdx !== -1
                    ? newStyleValue?.slice(newTransformIdx)
                    : newStyleValue;

                expect(newTransformValue).to.equal(originalTransformValue);
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
          expect(originalStyleValue).to.contain("transform:");
          const originalTransformIdx =
            originalStyleValue?.indexOf("transform:");

          const originalTransformValue =
            originalTransformIdx === -1
              ? originalStyleValue
              : originalStyleValue?.slice(originalTransformIdx);

          cy.get(".levelSliderContainer").then(($levelSliderContainer) => {
            changeToRandomFloor($levelSliderContainer);

            cy.get("[data-cy='selected-node']")
              .parent()
              .invoke("attr", "style")
              .then((newStyleValue) => {
                expect(newStyleValue).to.contain("transform:");
                const newTransformIdx = newStyleValue?.indexOf("transform:");
                const newTransformValue =
                  newTransformIdx === -1
                    ? newStyleValue
                    : newStyleValue?.slice(newTransformIdx);

                expect(newTransformValue).to.equal(originalTransformValue);
              });
          });
        });
    });

    it(`Moving marzipano viewer should change the node's rotation `, () => {
      if (!zone.floors) return;

      cy.get("[data-cy='selected-node']")
        .parent()
        .invoke("attr", "style")
        .then((originalStyleValue) => {
          expect(originalStyleValue).to.contain("transform");
          const transformIdx = originalStyleValue?.indexOf("transform:");
          const originalTransformValue =
            transformIdx !== -1
              ? originalStyleValue?.slice(transformIdx)
              : originalStyleValue;

          moveMarzipanoViewer("#pano", {
            x: -250,
            y: 0,
            fromPosition: "center",
          });

          cy.get("[data-cy='selected-node']")
            .parent()
            .invoke("attr", "style")
            .then((newStyleValue) => {
              expect(newStyleValue).to.contain("transform:");
              const newTransformIdx = newStyleValue?.indexOf("transform");
              const newTransformValue =
                newTransformIdx !== -1
                  ? newStyleValue?.slice(newTransformIdx)
                  : newStyleValue;

              expect(newTransformValue).to.not.equal(originalTransformValue);
            });
        });
    });
  });

  // ? this needs to be after somehow or above tests won't work.
  describe("Test case: Marzipano config works as expected", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing: Marzipano cursor should change to "move"`, () => {
      cy.get("#pano").should("have.css", "cursor", "default");
      cy.get("#pano").realMouseDown();
      cy.get("#pano").should("have.css", "cursor", "move");
      cy.get("#pano").realMouseUp();
      cy.get("#pano").should("have.css", "cursor", "default");
    });
  });
});
