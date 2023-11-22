Cypress.Commands.add("testEachZone", (testFn: (url: string) => void): void => {
  const allURLs: string[] = Cypress.env("deployedZones");

  allURLs.forEach((zone) => {
    testFn(zone);
  });
});
