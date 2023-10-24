export interface ISettings {
  enableMultiSite?: boolean;
  mediaPageVisibility?: boolean;
  faqPageVisibility?: boolean;
  singleSiteSettings?: ISingleSiteSettings;
}

export interface ISingleSiteSettings {
  backgroundImage: string;
  siteTitle: string;
}

export interface ISites {
  _id: string;
  site_name: string;
  tag: string;
}
