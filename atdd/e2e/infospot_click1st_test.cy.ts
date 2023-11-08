describe("Test case: InforLinknode in Expanded Left Top Bar should match linkNode in 3D view, after click first nodelink and switch the scene", () => {
  it("should compare elements with .hotspot-tooltip and .linkNodeNames", () => {
    // Visit the page where your divs are located
    cy.visit("/site");

    // First, click on the first visible hotspot
    cy.get(".hotspot.link-hotspot")
      .filter((index, element) => {
        // Filter those elements based on a condition
        return Cypress.$(element).css("display") === "block";
      })
      .first()
      .as("firstVisible")
      .invoke("attr", "id", "firstVisibleHotspot")
      .click();
    cy.wait(1000); // Better to wait for a specific event than use a hardcoded wait

    // Second, get all other hotspots that are not the first visible one
    // cy.get("@firstVisible").then(($first) => {

    cy.get(".hotspot.link-hotspot")
      .filter((index, element) => {
        const grandparent = Cypress.$(element).parent().parent();
        // Make sure the grandparent element exists before trying to access its style
        return grandparent.length > 0 && grandparent.css("display") === "block";
      })
      // .not("#firstVisibleHotspot") // Exclude the first visible element that was clicked
      .find(".hotspot-tooltip")
      .then(($collection1) => {
        // Map through each .hotspot-tooltip and get their inner HTML content
        const htmlCollection1 = $collection1
          .map((index, html) => html.innerHTML)
          .get();
        // Retrieve the collection 2 of elements with .linkNodeNames
        cy.get(".linkButton").should("exist").click();
        cy.wait(1000);
        cy.get(".linkNodeNames")
          .should("exist")
          .then(($collection2) => {
            // Map through each element in collection2 and get their inner HTML content
            const htmlCollection2 = $collection2
              .map((index, html) => html.textContent ?? "")
              .get();

            // Wait for any asynchronous actions to complete before comparing the collections
            cy.wait(500); // Adjust the time according to your application's needs

            // Log the HTML content for the first element in each collection for debugging
            cy.log(`Collection1  HTML: ${htmlCollection1}`);
            cy.log(`Collection2 HTML: ${htmlCollection2}`);

            // Comparing the length of both collections
            // expect(
            //   htmlCollection1.length,
            //   "Both collections should have the same number of elements",
            // ).to.equal(htmlCollection2.length);

            // Continue with comparison content
            htmlCollection1.forEach((html, index) => {
              try {
                expect(html.trim()).to.equal(
                  htmlCollection2[index].trim(),
                  `HTML content of element ${index} should match`,
                );
              } catch (e) {
                console.error(`Error in element ${index}:`, e);
                console.log(
                  `Collection1 Element ${index} HTML: ${htmlCollection1[index]}`,
                );
                console.log(
                  `Collection2 Element ${index} HTML: ${htmlCollection2[index]}`,
                );
                throw e; // rethrow the error so Cypress knows the test failed
              }
            });
          });
      });
    // });
  });
});
