import { testEachZone } from "../testutils";

testEachZone((zone: Cypress.PrismZone) => {
  describe("Test case:prism Logo", () => {
    beforeEach(() => {
      cy.accessZone(zone);
    });

    it(`Testing in each Zone: check logo`, () => {
      cy.get("img.prismLogo").should("exist");
    });
  });
});
// describe("a dummy test", () => {
//   it("test nothing", () => {});
// });
