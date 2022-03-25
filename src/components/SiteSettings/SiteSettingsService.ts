import { ISite, Site, SiteSettings } from './SiteSettingsModel';
import { Response } from 'express-serve-static-core';

export abstract class SiteService {
  static async getSettings(res: Response) {
    return {
      settings: await SiteSettings.find(),
    };
  }
  static async getSites() {
    return {
      sites: await Site.find(),
    };
  }
  static async createSite(site: ISite) {
    const createSite = await Site.create(site);
    return createSite;
  }
}
