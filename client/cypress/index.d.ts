declare namespace Cypress {
  interface PrismZone {
    project: string;
    url: { local: string; uat: string };
    singleSite: boolean;
    hotspots: boolean;
    timeline: boolean;
    floors: boolean;
    adminUser: boolean;
  }

  interface Chainable<> {
    accessZone(zone: PrismZone): void;
  }
}
