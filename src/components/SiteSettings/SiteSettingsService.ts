import { ISite, Site, SiteSettings } from './SiteSettingsModel';
import { Response } from 'express-serve-static-core';
import { ObjectId, ObjectID } from 'bson';

export abstract class SiteService {
  static async getSettings(siteId: string) {
    return {
      settings: await SiteSettings.find({ site: new ObjectId(siteId) }),
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
