import { Request, Response } from 'express';
import { IResponse } from '../../utils/CommonUtil';
import { CommonUtil } from '../../utils/CommonUtil';

import mapPinsService from './MapPinsService';
import { IMapPins, MapPins } from './MapPinsModel';

/**
 * Controller for getting site specific settings
 */
class MapPinsController {
  public async getAllPins(req: Request, res: Response) {
    try {
      const results = await mapPinsService.getMapPins();
      if (!results) throw new Error('No map pins found');
  
      return CommonUtil.successResponse<IResponse<IMapPins>>(
        res,
        '',
        results.mapPins,
      );
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }

  public async getPin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('id is a required parameter');

      const result = await mapPinsService.getMapPin(id);
      if (!result) throw new Error('Map pins found');
      
      return CommonUtil.successResponse<IResponse<IMapPins>>(
        res,
        '',
        result.mapPin,
      );
    } catch (e) {
      return CommonUtil.failResponse
    }
  }

  public async createPin(req: Request, res: Response) {
    try {
      const body: IMapPins = new MapPins(req.body);
      if (!body) return CommonUtil.failResponse(res, 'Body is incorrect');

      const result = await mapPinsService.createMapPin(body);
      if (!result) throw new Error('Map pin could not be created');

      return CommonUtil.successResponse<IResponse<IMapPins>>(
      res,
      'Map Pin has been created',
    );
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }

  public async updatePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: IMapPins = req.body;

      const update = await mapPinsService.updateMapPin(id, body);
      if (!update) ("MapPin cannot be updated");

      return CommonUtil.successResponse<IResponse<IMapPins>>(
        res,
        'Map Pin has been updated',
      );
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }

  public async deletePin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('id is a required parameter');

      const deletePin = await mapPinsService.deleteMapPin(id);
      if (!deletePin) throw new Error("Map Pin cannot be deleted");

      return CommonUtil.successResponse<IResponse<IMapPins>>(
        res,
        'Map Pin has been deleted',
      );

    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }
}

export default MapPinsController;
