describe("Minimap scales and displays hotspots", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy=mini-map]").should("exist");
  });

  it("Minimap should toggle scaling on click", () => {
    cy.get(".small-map-img").click({ force: true });
    cy.get("[data-cy=minimap-large]").should("exist");
    cy.get("[data-cy=minimap-large]").click();
    cy.get("[data-cy=minimap-small]").should("exist");
  });

  it("Minimap should display nodes", () => {
    cy.get("[data-cy=mini-map]")
      .find("[data-cy=node]")
      .should("have.length.greaterThan", 1);
    cy.get("[data-cy=mini-map]")
      .find("[data-cy=selected-node]")
      .should("have.length", 1);
  });

  it("Minimap filter should turn off on hover", () => {
    cy.get("[data-cy=mini-map]")
      .find("[data-cy=node]")
      .first()
      .trigger("mouseover", { force: true });
    cy.get("[data-cy=mini-map]")
      .find("img")
      .should("have.css", "filter")
      .and("match", /none/);
  });

  it("Clicking nodes on minimap should move Marzipano", () => {
    // TODO: Unit Test - Set up checking if clicking changes pano. need to confirm working
    //cy.mount(App)
    /*
      cy.get(App)
      .its('state')
      .should('deep-equal', { 'currPanoId': '15-img_4216-panorama' })
    */

    cy.get("[data-cy=mini-map]")
      .find("[data-cy=node]")
      .eq(0)
      .then((node) => {
        const id = node.attr("id");
        node.click();
        cy.get("[data-cy=selected-node]").should("have.id", id);
      });

    cy.get("[data-cy=mini-map]").click();
    cy.get("[data-cy=mini-map]")
      .find("[data-cy=node]")
      .eq(1)
      .then((node) => {
        const id = node.attr("id");
        node.click();
        cy.get("[data-cy=selected-node]").should("have.id", id);
      });
  });
});
