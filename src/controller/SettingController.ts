import { Request, Response } from "express";
import { CommonUtil } from "../utils/CommonUtil";
import { Settings } from "../models/SettingModel";

export class SettingController {
  /**
   * Get settings
   * @param req (params, body)
   * @param res
   */
  public async getSettings(req: Request, res: Response) {
    const isTableExist = await Settings.findOne();
    if (!isTableExist) {
      const seeder = {
        enableMultiSite: false,
        mediaPageVisibility: false,
        faqPageVisibility: false,
      };
      const initialVal = await new Settings(seeder);
      await initialVal.save();
      return CommonUtil.successResponse(res, "", initialVal);
    }

    return CommonUtil.successResponse(res, "", isTableExist);
  }

  /**
   * Toggle Media and FAQ page visibility
   * @param req (params, body)
   * @param res
   */
  public async togglePagesVisibility(req: Request, res: Response) {
    const { username } = req.params;
    const { user } = res.locals;
    const { mediaPageVisibility, faqPageVisibility } = req.body;

    if (user.username !== username)
      return CommonUtil.failResponse(res, "user is not authorized");
    const settings = await Settings.find();
    if (mediaPageVisibility !== undefined)
      await Settings.updateOne(
        { mediaPageVisibility: settings[0].mediaPageVisibility },
        { mediaPageVisibility },
      );
    if (faqPageVisibility !== undefined)
      await Settings.updateOne(
        { faqPageVisibility: settings[0].faqPageVisibility },
        { faqPageVisibility },
      );

    return CommonUtil.successResponse(res, "Setting is successfully updated");
  }
}
