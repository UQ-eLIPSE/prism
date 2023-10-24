export interface InfoHotspotData {
  id: string;
  header: {
    mainImgUrl: string;
    labelTitle: string;
    mainTitle: string;
    description: string;
  };
  locations: string[];
  performanceUrl: string;
  processUrl: string;
  resources: {
    url: string;
    type: string;
  }[];
}
