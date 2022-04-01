import { Request, Response } from 'express';
import { ISite, ISiteSettings, Site } from './SiteModel';
import { IResponse } from '../../utils/CommonUtil';
import { CommonUtil } from '../../utils/CommonUtil';

import SiteService from './SiteService';

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
    if (!siteId) return CommonUtil.failResponse(res, 'Site Id is not provided');
    const results = await SiteService.getSettings(siteId);
    if (!results) return CommonUtil.failResponse(res, 'No Setting is found');

    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      '',
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
    if (!results) return CommonUtil.failResponse(res, 'No Setting is found');

    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      '',
      results.sites,
    );
  }
  public async getSiteMap(req: Request, res: Response) {
    const results = await SiteService.getSiteMap();
    if (!results) return CommonUtil.failResponse(res, 'No Site Map is found');
    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      '',
      results.siteMap,
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
    if (!createSite) return CommonUtil.failResponse(res, 'No Setting is found');
    return CommonUtil.successResponse<IResponse<ISiteSettings>>(
      res,
      '',
      createSite,
    );
  }
}

export default SiteController;
