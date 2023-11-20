// Function to test each zone with proper TypeScript annotations
const testEachZone = (testFn: (url: string) => void): void => {
  const allURLs: string[] = Cypress.env("deployedZones");

  allURLs.forEach((zone) => {
    testFn(zone);
  });
};

export { testEachZone };
