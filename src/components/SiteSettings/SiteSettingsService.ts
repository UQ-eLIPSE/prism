import { Site, SiteSettings } from './SiteSettingsModel';
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
}
