describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view", () => {
  it("should compare elements with .hotspot-tooltip and .linkNodeNames", () => {
    // Visit the page where your divs are located
    cy.visit("/");

    cy.get('[data-cy="sb-site"]').click();
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
  });
});
