import { ISite, Site, SiteMap, SiteSettings } from './SiteModel';
import { ObjectId } from 'bson';

abstract class SiteService {
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
  static async getSiteMap() {
    return {
      siteMap: await SiteMap.find(),
    };
  }
  static async createSite(site: ISite) {
    const createSite = await Site.create(site);
    return createSite;
  }
}

export default SiteService;
