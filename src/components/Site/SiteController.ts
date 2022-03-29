import { Request, Response } from 'express';
import { ISite, ISiteSettings } from './SiteModel';
import { IResponse } from '../../utils/CommonUtil';
import { CommonUtil } from '../../utils/CommonUtil';

import { SiteService } from './SiteService';

/**
 * Controller for getting site specific settings
 */
export class SiteSettingsController {
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
   * @returns
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
