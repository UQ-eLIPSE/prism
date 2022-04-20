import { IMapPins, MapPins } from './MapPinsModel';
import { ObjectId } from 'bson';
import { Site } from '../Site/SiteModel';

class SiteService {
  /**
   * getMapPins
   * Retrieves all entries of map_pins collection.
   * @returns Success response of an array of map_pins
   */
  static async getMapPins() {
    const mapPins = await MapPins.find();
    const mapPinsWithSite = await Promise.all(
      mapPins.map(async (mapPin) => {
        const site = await Site.findById(mapPin.site);
        if (site === null) return mapPin;

        const site_name = site.site_name;
        const mapPinJson = mapPin.toJSON();

        return {
          ...mapPinJson,
          site_name,
        };
      }),
    );
    return {
      mapPins: mapPinsWithSite,
    };
  }
  /**
   * getMapPin
   * Returns a map_pin with the given Id.
   * @param id - used as a primary key to retrieve the document
   * @returns Success response of a map_pin.
   */
  static async getMapPin(id: string) {
    const mapPin = await MapPins.findOne({ _id: new ObjectId(id) });
    if (mapPin === null) throw new Error('Map Pin not found');

    const site = await Site.findById(mapPin.site);
    if (site === null) return mapPin;

    const mapPinJSON = mapPin.toJSON();

    return {
      ...mapPinJSON,
      site_name: site.site_name,
    };
  }

  static async createMapPin(mapPin: IMapPins) {
    return {
      mapPin: await mapPin.save(),
    };
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
