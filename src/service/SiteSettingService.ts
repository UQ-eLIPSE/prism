import { User } from '../models/UserModel';
import { SiteSettings } from '../models/SiteSettingsModel';
import { CommonUtil } from '../utils/CommonUtil';
import { Response } from 'express-serve-static-core';

export abstract class SiteService {
  static async getSettings(res: Response) {
    return {
      settings: await SiteSettings.find(),
    };
  }
}
