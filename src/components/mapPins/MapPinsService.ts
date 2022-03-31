import { IMapPins, MapPins } from './MapPinsModel';
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

  static async createMapPin(mapPin: IMapPins) {
    return {
      mapPin: await mapPin.save()
    }
  }

  static async updateMapPin(id: string, mapPin: IMapPins) {
    const save = await MapPins.findByIdAndUpdate(new ObjectId(id), mapPin);
    if (!save) return false;
    return true;
  }

  static async deleteMapPin(id: string) {
    const deletePin = await MapPins.findByIdAndDelete(id);
    if (!deletePin) return false;
    return true;
  }
}

export default SiteService;
