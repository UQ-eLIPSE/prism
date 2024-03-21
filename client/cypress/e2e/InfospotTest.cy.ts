import { testEachZone, hotspotsDropdownConsistencyCheck } from "../testutils";

// Please change hotspots property in cypress.config.ts depending on the project.
// A good way to do this is to look at the project localhost:3000/site and check
// if there's a dropdown menu top-right corner.
// If no dropdown menu, set hotspots to false, otherwise set it to true.
testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing in each Zone: should compare elements with .hotspot-tooltip and .linkNodeNames on the first landing view`, () => {
      if (zone.hotspots) {
        hotspotsDropdownConsistencyCheck();
      }
    });

    it("Testing in each Zone: clicks each mininode element and then compares", () => {
      cy.get("[class^='_minimap_node_']").then(($elements) => {
        $elements.each((index, element) => {
          cy.wrap(element)
            .click({ force: true })
            .then(() => {
              if (zone.hotspots) {
                hotspotsDropdownConsistencyCheck();
              }
            });
        });
      });
    });
  });
});
