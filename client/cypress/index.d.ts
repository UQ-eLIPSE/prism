declare namespace Cypress {
  interface PrismZone {
    url: string;
    singleSite: boolean;
    hotspots: boolean;
    timeline: boolean;
    adminUser: boolean;
  }

  interface Chainable<> {
    accessZone(zone: PrismZone): void;
  }
}
