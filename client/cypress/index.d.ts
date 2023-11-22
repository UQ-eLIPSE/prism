// cypress/index.d.ts or cypress/support/index.d.ts

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Custom command to test each zone.
     * @example cy.testEachZone((url) => { ... })
     */
    testEachZone(testFn: (url: string) => void): void;
  }
}
