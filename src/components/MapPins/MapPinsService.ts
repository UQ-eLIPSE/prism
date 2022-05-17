import { IMapPins, MapPins } from './MapPinsModel';
import { ObjectId } from 'bson';
import { Site } from '../Site/SiteModel';

import * as fs from 'fs/promises';
import { execSync } from 'child_process';

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

  public static async uploadPreview(
    file: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: {};
  }> {
    try {
      const { MANTA_ROOT_FOLDER, MANTA_HOST_NAME, MANTA_USER, MANTA_SUB_USER, MANTA_ROLES, MANTA_KEY_ID } = process.env;
      if (file === undefined) throw new Error('File is undefined');

      // Upload on to Manta
      const upload = execSync(
        `mput -f ${file.path} ${MANTA_ROOT_FOLDER} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`,
      );

      if (!upload) throw new Error("Preview image couldn't be uploaded.");

      // Delete file from local tmp.
      await fs.unlink(file.path);

      return {
        success: true,
        message: 'Preview image has been uploaded',
        data: {
          url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
        }
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message, data: {} };
    }
  }
}

export default SiteService;
