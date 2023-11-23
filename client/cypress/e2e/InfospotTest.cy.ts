import { testEachZone, performChecks } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing in each Zone: should compare elements with .hotspot-tooltip and .linkNodeNames`, () => {
      if (zone.hotspots) {
        performChecks();
      }
    });

    it("Testing in each Zone: clicks each mininode element and then compares", () => {
      cy.get("[class^='_minimap_node']").then(($elements) => {
        $elements.each((index, element) => {
          cy.wrap(element)
            .click({ force: true })
            .then(() => {
              if (zone.hotspots) {
                performChecks();
              }
            });
        });
      });
    });
  });
});

