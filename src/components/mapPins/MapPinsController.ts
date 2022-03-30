import { Request, Response } from 'express';
import { IResponse } from '../../utils/CommonUtil';
import { CommonUtil } from '../../utils/CommonUtil';

import mapPinsService from './MapPinsService';
import { IMapPins } from './MapPinsModel';

/**
 * Controller for getting site specific settings
 */
class MapPinsController {
  public async getAllPins(req: Request, res: Response) {
    const results = await mapPinsService.getMapPins();
    if (!results) return CommonUtil.failResponse(res, 'No map pins found');

    return CommonUtil.successResponse<IResponse<IMapPins>>(
      res,
      '',
      results.mapPins,
    );
  }

  public async getPin(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return CommonUtil.failResponse(res, 'id is a required parameter');
    const result = await mapPinsService.getMapPin(id);
    if (!result) return CommonUtil.failResponse(res, 'Map pins found');
    return CommonUtil.successResponse<IResponse<IMapPins>>(
      res,
      '',
      result.mapPin,
    );
  }

  public async createPin(req: Request, res: Response) {
    try {
      console.log(req.body);
      const body = JSON.parse(req.body);
      //cal service layer
      console.log(body);
    } catch (e) {
      console.log(e);
    }

    return CommonUtil.successResponse<IResponse<IMapPins>>(res, '', {});
  }

  public async updatePin(req: Request, res: Response) {
    try {
      console.log(req.body);
      const body = JSON.parse(req.body);
      //call service layer
      console.log(body);
    } catch (e) {
      console.log(e);
    }

    return CommonUtil.successResponse<IResponse<IMapPins>>(res, '', {});
  }

  public async deletePin(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return CommonUtil.failResponse(res, 'id is a required parameter');
    // const result = await mapPinsService.getMapPin(id); @TODO update pin
    if (!result) return CommonUtil.failResponse(res, 'Map pins found');
    return CommonUtil.successResponse<IResponse<IMapPins>>(
      res,
      '',
      result.mapPin,
    );
  }
}

export default MapPinsController;
