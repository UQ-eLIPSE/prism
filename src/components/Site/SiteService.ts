import { ISite, ISiteMap, Site, SiteMap, SiteSettings } from './SiteModel';
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
  /**
   *  This function returns a sitemap based off its unique name. If a name
   * is not specified then it is assumed only one map exists and will return
   * this one.
   * @returns a sitemap object
   */
  static async getSitemap(sitemapName?: string) {
    if (sitemapName) {
      return { sitemap: await SiteMap.findOne({ name: sitemapName }) };
    }
    return {
      sitemap: await SiteMap.findOne(),
    };
  }

  /**
   * mongo command to check if there are sitemaps with the same name,
   * if true then an object is returned otherwise it is null
   * @param sitemapName the sitemap name (if it exists in the db already)
   * @returns a sitemap object or null
   */
  static async checkForDuplicateSitemaps(sitemapName: string) {
    return await SiteMap.findOne({ name: sitemapName });
  }

  /**
   * mongo command to create a sitemap object
   * @param sitemap
   * @returns
   */
  static async createSitemap(sitemap: ISiteMap) {
    return await SiteMap.create(sitemap);
  }

  /**
   * create a sitemap object into the db
   * @param site a sitemap object
   * @returns sitemap object or null (on fail)
   */
  static async createSite(site: ISite) {
    const createSite = await Site.create(site);
    return createSite;
  }
}

export default SiteService;
