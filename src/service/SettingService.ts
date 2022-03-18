import { User } from '../models/UserModel';
import { SiteSettings } from '../models/SiteSettingsModel';
import { CommonUtil } from '../utils/CommonUtil';
import { Response } from 'express-serve-static-core';

export abstract class SiteSettingService {
  static async getSiteSetting(res: Response) {
    const setting = await SiteSettings.find();
    if (!setting) return CommonUtil.failResponse(res, 'No Setting is found');
    return {
      setting,
    };
  }
}
