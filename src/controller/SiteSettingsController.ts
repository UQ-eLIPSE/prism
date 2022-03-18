import { Request, Response } from 'express';
import { ISiteSettings } from '../models/SiteSettingsModel';
import { IResponse } from '../utils/CommonUtil';
import { CommonUtil } from '../utils/CommonUtil';

import { SiteService } from '../service/SiteSettingService';

export class SiteSettingsController {
  /**
   * Get settings for the frontend
   * @param req
   * @param res
   */
  public async getSettings(req: Request, res: Response) {
    const results = await SiteService.getSettings(res);
    if (!results) return CommonUtil.failResponse(res, 'No Setting is found');

    return CommonUtil.successResponse<IResponse<ISiteSettings>>(res, '', results.settings[0]);
  }
}
