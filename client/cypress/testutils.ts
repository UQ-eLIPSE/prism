// Function to test each zone with proper TypeScript annotations
const testEachZone = (testFn: (zone: Cypress.PrismZone) => void): void => {
  const allZones: Cypress.PrismZone[] = Cypress.env("deployedZones");

  allZones.forEach((zone: Cypress.PrismZone) => {
    testFn(zone);
  });
};

export { testEachZone };
