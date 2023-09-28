import { Request, Response } from "express";
import { ISite, ISiteSettings, SiteMap } from "./SiteModel";
import { IResponse } from "../../utils/CommonUtil";
import { CommonUtil } from "../../utils/CommonUtil";

import SiteService from "./SiteService";
import { ObjectId } from "mongodb";

/**
 * Controller for getting site specific settings
 */
class SiteController {
  /**
   * Get settings for the frontend
   * @param req
   * @param res
   */
  public async getSettings(req: Request, res: Response) {
    const { siteId } = req.params;
    if (!siteId) return CommonUtil.failResponse(res, "Site Id is not provided");
    const results = await SiteService.getSettings(siteId);
    if (!results) return CommonUtil.failResponse(res, "No Setting is found");

    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      "",
      results.settings[0],
    );
  }

  /**
   * Get all sites controller
   * @param req
   * @param res
   * @returns success response, array of sites
   * or fail response
   */
  public async getSites(req: Request, res: Response) {
    const results = await SiteService.getSites();
    if (!results) return CommonUtil.failResponse(res, "No Setting is found");

    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      "",
      results.sites,
    );
  }

  /**
   * This function renders the sitemap for the homepage. If no name is specified
   * then it is assumed only one sitemap exists and the first one will be returned
   * @param req contains either nothing or a site map name
   * @returns a sitemap object
   */
  public async getSitemap(req: Request, res: Response) {
    const { name } = req.params;
    const results = name
      ? await SiteService.getSitemap(name)
      : await SiteService.getSitemap();

    if (!results) return CommonUtil.failResponse(res, "No Site Map is found");
    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      "",
      results.sitemap,
    );
  }

  /**
   * Create site Controller
   * @param req
   * @param res
   * @returns
   */
  public async createSite(req: Request, res: Response) {
    const site: ISite = req.body;

    const createSite = await SiteService.createSite(site);
    if (!createSite) return CommonUtil.failResponse(res, "No Setting is found");
    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      "",
      createSite,
    );
  }

  /**
   * This function performs from checks before creating the site map
   * The sitemap name must always be lowercase and unique (acts as the id)
   * The name whitespace will also be changed to dashes to handle GET req
   * Trailing white space will also be removed from the name
   * @param req sitemap name, image url, tag (i.e "QLD", "NSW" etc)
   * @param res success or failure to upload to mongodb
   * @returns a sitemap on sucess
   */
  public async createSitemap(req: Request, res: Response) {
    const mapName: string = encodeURIComponent(req.body.name);

    const sitemap = new SiteMap({
      _id: new ObjectId(),
      name: mapName,
      image_url: req.body.image_url,
    });

    // check that the map is unique
    const isDuplicate = await SiteService.checkForDuplicateSitemaps(
      sitemap.name,
    );

    if (isDuplicate) {
      return CommonUtil.failResponse(
        res,
        "Duplicate sitemap name exists, please give map another name",
      );
    }
    const createSitemap = await SiteService.createSitemap(sitemap);
    if (!createSitemap)
      return CommonUtil.failResponse(res, "Failed to create new sitemap");
    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      "",
      createSitemap,
    );
  }
}

export default SiteController;
