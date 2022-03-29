import { MapPins } from './MapPinsModel';
import { Response } from 'express-serve-static-core';
import { ObjectId, ObjectID } from 'bson';

class SiteService {
  static async getMapPins() {
    return {
      mapPins: await MapPins.find(),
    };
  }

  static async getMapPin(id: string) {
    return {
      mapPin: await MapPins.find({ _id: new ObjectId(id) }),
    };
  }
}

export default SiteService;
