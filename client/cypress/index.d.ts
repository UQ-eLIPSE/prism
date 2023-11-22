declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to test each zone.
     * @example cy.testEachZone((zone) => { ... })
     */
    testEachZone(testFn: (zone: string) => void): void;
  }
}
