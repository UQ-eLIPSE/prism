declare namespace Cypress {
  interface PrismZone {
    rotation: boolean;
    project: string;
    url: { local: string; uat: string };
    singleSite: boolean;
    hotspots: boolean;
    timeline: boolean;
    floors: boolean;
    adminUser: boolean;
    documentation: boolean;
  }

  interface Chainable<> {
    accessZone(zone: PrismZone): void;
  }
}
