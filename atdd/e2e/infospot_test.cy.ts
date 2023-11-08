describe("Minimap Test", () => {
  it("should compare elements with .hotspot-tooltip and .linkNodeNames", () => {
    // Visit the page where your divs are located
    cy.visit("/");
    // Click a html element with attribute data-cy="minimap-small"
    cy.get('[data-cy="sb-site"]').click();
    cy.wait(500);
    // cy.get('[data-cy="minimap-small"]').should("exist").click();
    // Click the first element with data-cy="node"
    // cy.get("#34-img_4073-panorama").first().should("exist").click();

    // Retrieve the collection 1 of elements with .hotspot-tooltip that are visible
    cy.wait(1000);
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
        cy.wait(1000);
        cy.get('[data-cy="link-node-names"]')
          .should("exist")
          .then(($collection2) => {
            // Map through each element in collection2 and get their inner HTML content
            const htmlCollection2 = $collection2
              .map((index, html) => html.innerHTML)
              .get();

            // Wait for any asynchronous actions to complete before comparing the collections
            cy.wait(500); // Adjust the time according to your application's needs

            // Log the HTML content for the first element in each collection for debugging
            cy.log(`Collection1 Element 0 HTML: ${htmlCollection1[0]}`);
            cy.log(`Collection2 Element 0 HTML: ${htmlCollection2[0]}`);

            // Comparing the length of both collections
            expect(
              htmlCollection1.length,
              "Both collections should have the same number of elements"
            ).to.equal(htmlCollection2.length);

            // Continue with comparison content
            htmlCollection1.forEach((html, index) => {
              expect(html.trim()).to.equal(
                htmlCollection2[index].trim(),
                `HTML content of element ${index} should match`
              );
            });

            // Compare the length of both collections
            // expect(
            //   $collection1.length,
            //   "number of visible .hotspot-tooltip elements"
            // ).to.equal(1);
            // expect(
            //   $collection1.length,
            //   "number of visible .hotspot-tooltip elements"
            // ).to.not.equal($collection2.length);
          });
      });
  });
});
