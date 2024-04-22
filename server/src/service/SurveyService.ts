/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express-serve-static-core";
import { ISite, SiteSettings } from "../components/Site/SiteModel";
import {
  SurveyNode,
  MinimapConversion,
  MinimapNode,
  Survey,
  MinimapImages,
} from "../models/SurveyModel";
import { MapPins } from "../components/MapPins/MapPinsModel";
import { CommonUtil } from "../utils/CommonUtil";
import * as fs from "fs/promises";
import csv = require("csvtojson");
import process = require("process");
import ImageSize from "image-size";
import { execSync } from "child_process";
import { ObjectId } from "bson";
import { uploadZipManta } from "../utils/mantaUtil";
import { ConsoleUtil } from "../utils/ConsoleUtil";

/**
 * createMinimapImages
 * Creates a new entry in the MinimapImages collection for a given site and floor.
 * The new entry includes default values for scale, offset, and xy_flipped properties.
 * @param siteId - The unique identifier of the site.
 * @param floor - The floor number for which the minimap image is being created.
 * @returns The newly created MinimapImages object if successful, otherwise throws an error.
 */
export async function createMinimapImages(siteId: string, floor: string) {
  const addedMinimapFloorImages = await MinimapImages.create({
    _id: new ObjectId(),
    floor: floor,
    floor_name: "Level " + floor,
    floor_tag: floor,
    site: new ObjectId(siteId),
    x_scale: 1,
    y_scale: 1,
    xy_flipped: false,
    x_pixel_offset: 0,
    y_pixel_offset: 0,
  });

  if (!addedMinimapFloorImages) {
    throw new Error("Failed to add images entry to database.");
  }

  return addedMinimapFloorImages;
}

// this packages uses require over import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");

interface CSVProperties {
  floor?: string;
  title?: string;
  fileName: string;
  x: string;
  y: string;
  date?: string;
  survey_name?: string;
}
export abstract class SurveyService {
  /**
   * unzipValidateFile
   * Unzip the provided Marzipano file and validate against the CSV and structure
   * Upload the files to Manta once validation is successful
   * @param files - Request Files that contains the CSV and .ZIP
   * @param site - The associated site with the provided Id
   * @returns Boolean response of true if validation and upload is successful or false
   */
  static async unzipValidateFile(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
  ) {
    try {
      const { zipFile, properties } = files;

      // Check if the files are zip and csv.
      if (
        zipFile[0].mimetype !== "application/zip" &&
        properties[0].mimetype !== "text/csv"
      )
        throw new Error("Invalid file types");

      // Create a zip stream for the zip file.
      const zip = new StreamZip({
        file: `${zipFile[0].path}`,
        storeEntries: true,
      });

      // Folder without .zip ext
      const extractedFolder = zipFile[0].filename.replace(".zip", "");

      zip.on("error", (err: any) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

      // Get Open CSV and convert to JSON.
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error("Incorrect CSV format");

      // eslint-disable-next-line no-async-promise-executor
      const zipOp = await new Promise(async (resolve, reject) => {
        await zip.on("ready", async () => {
          const entries = Object.values(zip.entries());

          // Check if the images exist
          for (const field of csvJSON) {
            const checkImageExist = entries.some((entry: any) =>
              entry.name.includes(`${field.fileName}`),
            );
            if (!checkImageExist)
              reject(
                "Image does not exist, please upload your CSV file again with the correct file name.",
              );
          }

          // Check Marzipano app files exist
          const appFilesExist = entries.some(
            (entry: any) =>
              entry.name.endsWith("app-files/") && entry.isDirectory,
          );

          // Check Data.js exists as part of the Marzipano zip.
          const dataJsExist = entries.some((entry: any) =>
            entry.name.includes("app-files/data.js"),
          );

          if (!appFilesExist || !dataJsExist)
            reject("Marzipano folder structure is not correct");

          // Extract zip
          await zip.extract(
            null,
            `${process.env.TMP_FOLDER}/${zipFile[0].filename.replace(
              ".zip",
              "",
            )}`,
            (err: any) => {
              ConsoleUtil.error(err ? "Extract error" : "Extracted");
              zip.close();

              err ? reject() : resolve("Extracted");
            },
          );
        });
      });

      if (!zipOp) throw new Error("Zip op failed");

      // Check data.js and match the tile names
      const readData = await fs.readFile(
        `${process.env.TMP_FOLDER}/${zipFile[0].filename.replace(
          ".zip",
          "",
        )}/app-files/data.js`,
        "utf-8",
      );

      // Check file name against the tiles.
      for (const field of csvJSON) {
        if (!readData.includes(field.fileName))
          throw new Error("Image does not exist in the Marzipano zip file.");
      }

      // Upload tiles to Manta using Manta-Sync
      const uploadZip = await uploadZipManta(
        extractedFolder,
        site.tag.replaceAll(/[^a-zA-Z0-9-]/g, ""),
      );
      if (!uploadZip) return false;

      return true;
    } catch (e) {
      ConsoleUtil.error(e.message);
      return false;
    }
  }

  static async findAndUploadFloors(siteId: string, floor: string) {
    const minimapFloorObject = await MinimapImages.find({
      site: new ObjectId(siteId),
      floor: floor,
    });

    if (!minimapFloorObject.length) {
      const insertFloorToMinimap = await createMinimapImages(siteId, floor);
      return insertFloorToMinimap;
    }

    return minimapFloorObject;
  }
  /**
   * Upload to DB
   * This function uploads properties from the CSV files containing
   * // filename and minimap coordinates (As the minimum)
   * along with combining that data with the provided marzipano data.js for the survey_nodes.
   * @param files - Request Files that contains the CSV and .ZIP
   * @param site - The associated site with the provided Id
   * @returns Boolean response of true if the data is uploaded to db else false.
   */
  static async uploadToDB(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
    floorId: string,
  ) {
    try {
      const { zipFile, properties } = files;
      // Convert CSV to JSON
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error("Incorrect CSV format");
      const { MANTA_HOST_NAME, MANTA_ROOT_FOLDER, TMP_FOLDER } = process.env;

      const extractedFolder = zipFile[0].filename.replace(".zip", "");

      // Read from data.js
      const dataJS = await fs.readFile(
        `${TMP_FOLDER}/${extractedFolder}/app-files/data.js`,
        "utf8",
      );

      if (!dataJS) throw new Error("Cannot read data.js");

      const stringedJSONData = dataJS
        .replace("var APP_DATA = ", "")
        .replace(/;/g, "");

      const data = JSON.parse(stringedJSONData);

      if (!data.scenes) throw new Error("Scenes are not available");

      const scenes: any[] = data.scenes;

      const allFloors: any[] = [];

      // Upload data to DB
      // eslint-disable-next-line no-async-promise-executor
      const uploadData = await new Promise(async (resolve, reject) => {
        const totalFloors = csvJSON
          .map((el) => el.floor)
          .sort((a: any, b: any) => a - b);
        await scenes.forEach(async (scene, i) => {
          // Get CSV Element using the scene ID.
          const specElem = csvJSON.find(
            (el) =>
              el.fileName === scene.name ||
              el.fileName === scene.id ||
              el.title === scene.id ||
              el.title === scene.name,
          );

          // Reformat date per Australian standard
          if (specElem?.date) {
            const dateAtt = specElem.date.split("/");
            specElem.date = [dateAtt[1], dateAtt[0], dateAtt[2]].join("/");
          }

          if (specElem?.floor) {
            allFloors.push({
              siteId: site._id,
              floor: specElem.floor,
            });
          }

          // Upload Survey Nodes from DataJS
          const survey = await SurveyNode.create([
            {
              _id: new ObjectId(),
              info_hotspots: scene.infoHotspots,
              link_hotspots: scene.linkHotspots,
              levels: scene.levels,
              face_size: scene.faceSize,
              initial_parameters: scene.initialViewParameters,
              manta_link: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${site.tag.replaceAll(
                /[^a-zA-Z0-9-]/g,
                "",
              )}/`,
              node_number: i,
              survey_name: specElem?.survey_name ? specElem?.survey_name : "",
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              date: specElem?.date
                ? new Date(specElem.date)
                : new Date("01-01-1900"),
              site: new ObjectId(site._id),
            },
          ]);

          if (!survey) reject("Survey couldn't be uploaded");

          // Upload to minimap nodes
          const minimapNode = await MinimapNode.create([
            {
              _id: new ObjectId(),
              floor: specElem?.floor ? specElem.floor : floorId,
              node_number: i,
              survey_node: new ObjectId(survey[0]._id),
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              site: new ObjectId(site._id),
            },
          ]);

          if (!minimapNode) reject("Minimap Node cannot be uploaded");

          // Upload Minimap conversions with the provided x/y coords from the CSV
          const minimapConversion = await MinimapConversion.create([
            {
              _id: new ObjectId(),
              floor: specElem?.floor ? specElem.floor : floorId,
              minimap_node: new ObjectId(minimapNode[0]._id),
              survey_node: new ObjectId(survey[0]._id),
              x: specElem?.x,
              x_scale: 1,
              y: specElem?.y,
              y_scale: 1,
              site: new ObjectId(site._id),
              rotation: 0,
            },
          ]);

          if (!minimapConversion)
            reject("Minimap conversion cannot be uploaded.");

          // Link/Info Hotspots if included *TODO in different ticket*
        });

        // Check site settings exist - if so, don't recreate the document.
        const checkSiteSettingsExist = await SiteSettings.findOne({
          site: new ObjectId(site._id),
        });

        // Add Site Settings
        // NOTE: These values need to be created as part of sceen process.
        if (!checkSiteSettingsExist) {
          await SiteSettings.create({
            _id: new ObjectId(),
            enable: {
              timeline: true,
              rotation: true,
              media: false,
              faq: false,
              documentation: false,
              floors: true,
              about: false,
              animations: false,
              hotspots_nav: false,
            },
            initial_settings: {
              date: "2021-11-16T00:00:00.000+10:00",
              floor: 0 | parseInt(totalFloors[0] as string),
              pano_id: "",
              yaw: 0,
              pitch: 0,
              fov: 0,
              rotation_offset: 0,
            },
            animation: {
              url: "NA",
              title: "NA",
            },
            sidenav: {
              logo_url: "https://picsum.photos/20/20",
              subtitle_url: "https://picsum.photos/20/20",
            },
            display: {
              title: site.site_name,
              subtitle: site.site_name,
            },
            marzipano_mouse_view_mode: "drag",
            num_floors: 0,
            site: new ObjectId(site._id),
          });
        }

        resolve("Data Uploaded");
      });

      if (!uploadData) throw new Error("Data could not be uploaded.");

      if (allFloors.length > 0) {
        for (const floor of allFloors) {
          const uploadFloors = await this.findAndUploadFloors(
            floor.siteId,
            floor.floor,
          );
          if (!uploadFloors) throw new Error("Floors could not be uploaded.");
        }
      }

      // Delete files and folder
      await fs.unlink(properties[0].path);
      await fs.unlink(zipFile[0].path);
      await fs.rm(`${TMP_FOLDER}/${extractedFolder}`, {
        recursive: true,
      });

      return true;
    } catch (e) {
      ConsoleUtil.error(e.message);
      return false;
    }
  }

  static readFileData(userDetails: any, entries: any, zip: any) {
    const dataJs = entries.filter((entry: any) =>
      entry.name.endsWith("/data.js"),
    );
    let marzipanoData: any;
    const surveyNodeIds = new Set();
    const outputFile: any = [];

    const { MANTA_ROOT_FOLDER, PROJECT_NAME, MANTA_USER, MANTA_HOST_NAME } =
      process.env;
    return new Promise((resolve, reject) => {
      for (const data of dataJs) {
        zip.stream((<any>data).name, (err: any, stream: any) => {
          stream.on("data", (chunk: any) => {
            outputFile.push(chunk);
          });

          stream.on("end", async () => {
            marzipanoData = Buffer.concat(outputFile).toString("utf8");
            if (marzipanoData) {
              marzipanoData = marzipanoData.split("=")[1].replace(";", "");
              marzipanoData = JSON.parse(marzipanoData);

              const newSurvey = new Survey({
                survey_name: marzipanoData.name,
              });
              await newSurvey.save();

              for (let idx = 0; idx < marzipanoData.scenes.length; idx++) {
                const date = new Date().getTime();
                const newSurveyNode = new SurveyNode({
                  survey_name: marzipanoData.name,
                  uploadedAt: date,
                  uploadedBy: userDetails["username"],
                  mantaLink: `${MANTA_HOST_NAME}/${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${entries[0].name}`,
                  nodeNumber: idx,
                  tilesId: marzipanoData.scenes[idx].id,
                  tilesName: marzipanoData.scenes[idx].name,
                  initialParameters:
                    marzipanoData.scenes[idx].initialViewParameters,
                  linkHotspots: marzipanoData.scenes[idx].linkHotspots,
                  infoHotspots: marzipanoData.scenes[idx].infoHotspots,
                  levels: marzipanoData.scenes[idx].levels,
                  faceSize: marzipanoData.scenes[idx].faceSize,
                });

                await newSurveyNode.save();
                surveyNodeIds.add(newSurveyNode._id);

                await Survey.findOneAndUpdate(
                  { _id: newSurvey._id },
                  {
                    $push: {
                      survey_nodes: newSurveyNode._id,
                    },
                  },
                );

                const newMinimapCoversion = new MinimapConversion({
                  surveyNode: newSurveyNode._id,
                });
                await newMinimapCoversion.save();

                const newMinimapNode = new MinimapNode({
                  nodeNumber: idx,
                  tilesId: marzipanoData.scenes[idx].id,
                  tilesName: marzipanoData.scenes[idx].name,
                  surveyNode: newSurveyNode._id,
                });

                await newMinimapNode.save();
              }

              resolve(surveyNodeIds);
            }

            zip.close();
          });
          stream.on("error", reject);
        });
      }
    });
  }

  static readSurveyJson(entries: any, zip: any) {
    const surveyJson = entries.filter((entry: any) =>
      entry.name.endsWith("survey.json"),
    );
    let minimapData: any;

    return new Promise((resolve, reject) => {
      zip.stream((<any>surveyJson)[0].name, (err: any, stream: any) => {
        stream.on("data", (chunk: any) => {
          minimapData = chunk.toString("utf8");
          if (minimapData) {
            minimapData = JSON.parse(minimapData);
            resolve(minimapData);
          }
        });

        stream.on("end", () => zip.close());
        stream.on("error", reject);
      });
    });
  }

  static async setSurveyPagination(
    maxResult: number,
    pageNo: number,
    size: number,
    res: Response,
    fieldToSearch?: object,
  ) {
    const mongoQuery: any = {};

    mongoQuery.limit = size;
    mongoQuery.skip = size * pageNo - size;

    const allSurveys = await Survey.find(fieldToSearch as any, {}, mongoQuery);
    if (!allSurveys) return CommonUtil.failResponse(res, "No survey is found");

    const totalCount = await Survey.countDocuments(fieldToSearch as any);
    const nextPage =
      pageNo < Math.ceil(totalCount / size) ? pageNo + 1 : pageNo;

    return {
      currentPage: pageNo,
      pageSize: size,
      totalPages: Math.ceil(totalCount / size),
      nextPage: nextPage,
      surveys: allSurveys,
    };
  }

  public static extractZip(destPath: string, entries: any, zip: any) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve) => {
      zip.extract(null, destPath, (err: any) => {
        // eslint-disable-next-line no-console
        console.log(err ? "Extract error" : `Extracted entries`);
        zip.close();
        resolve("");
      });
    });
  }

  public static async updateNodeCoordinates(
    nodeId: string,
    x: number,
    y: number,
  ) {
    const updateNodeCoords = await MinimapConversion.findOneAndUpdate(
      { survey_node: new ObjectId(nodeId) },
      {
        x: x,
        y: y,
      },
    );

    return updateNodeCoords ? true : false;
  }

  public static async updateNodeRotation(nodeId: string, rotation: number) {
    const updateNodeRotation = await MinimapConversion.findOneAndUpdate(
      { survey_node: new ObjectId(nodeId) },
      {
        rotation: rotation,
      },
    );

    return updateNodeRotation ? true : false;
  }

  public static async updateTileName(nodeId: string, tileName: string) {
    const updateTileName = await SurveyNode.findOneAndUpdate(
      { _id: new ObjectId(nodeId) },
      {
        tiles_name: tileName,
      },
    );
    return updateTileName ? true : false;
  }
  /**
   * createMinimap - - Inserts Mini Map in to site Settings and upload
   * to Manta.
   * @param file - Uploaded file
   * @param site - Provided Site
   * @returns
   */
  public static async createMinimap(
    file: Express.Multer.File,
    floor: number,
    site: ISite,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const {
        MANTA_ROOT_FOLDER,
        MANTA_HOST_NAME,
        MANTA_SUB_USER,
        MANTA_ROLES,
        MANTA_USER,
        MANTA_KEY_ID,
      } = process.env;
      if (file === undefined) throw new Error("File is undefined");

      // Upload on to Manta
      const upload = execSync(
        `mput -f ${file.path} ${MANTA_ROOT_FOLDER} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --keyId=${MANTA_KEY_ID} --role=${MANTA_ROLES} --url=${MANTA_HOST_NAME}`,
      );

      if (!upload) throw new Error("Mini map couldn't be uploaded.");

      const saveMiniMap = await MinimapImages.findOneAndUpdate(
        { floor, site: site._id },
        {
          $set: {
            image_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
            image_large_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
            img_width: ImageSize(file.path).width,
            img_height: ImageSize(file.path).height,
          },
          $setOnInsert: {
            x_scale: 1,
            y_scale: 1,
            xy_flipped: false,
            x_pixel_offset: 0,
            y_pixel_offset: 0,
          },
        },
        { upsert: true, new: true },
      );

      if (!saveMiniMap) throw new Error("Mini Map Cannot Be Saved");

      // Delete file from local tmp.
      await fs.unlink(file.path);

      return {
        success: true,
        message: "Site Map has been saved",
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return { success: false, message: e.message };
    }
  }

  public static async updateMinimapFloorDetails(
    site: ISite,
    floor: number,
    floor_name: string,
    floor_tag: string,
  ) {
    try {
      const getCurrentSiteMap = await MinimapImages.findOne(
        { floor, site: new ObjectId(site._id) },
        "-_id",
      );

      if (!getCurrentSiteMap)
        throw new Error("Site Map / Floor combination does not exist");

      const saveSiteMap = await MinimapImages.findOneAndUpdate(
        { floor, site: new ObjectId(site._id) },
        {
          floor_name: floor_name,
          floor_tag: floor_tag,
        },
      );

      if (!saveSiteMap) throw new Error("Site Map Cannot Be Saved");

      return {
        success: true,
        message: "Site Map has been saved",
      };
    } catch (e) {
      ConsoleUtil.error(e);
      return { success: false, message: e.message };
    }
  }

  public static async getSiteExistence(
    site: string,
  ): Promise<{ success: boolean }> {
    try {
      const data = await MapPins.countDocuments({
        site: new ObjectId(site),
      });

      return { success: data ? true : false };
    } catch (e) {
      return { success: false };
    }
  }

  public static async getSitePopulated(
    site: string,
  ): Promise<{ success: boolean }> {
    try {
      const data = await SurveyNode.countDocuments({
        site: new ObjectId(site),
      });

      return { success: data ? true : false };
    } catch (e) {
      return { success: false };
    }
  }

  public static async getFloorPopulated(
    siteId: string,
    floorId: number,
  ): Promise<{ success: boolean }> {
    try {
      const data = await MinimapNode.countDocuments({
        $and: [{ site: new ObjectId(siteId) }, { floor: floorId }],
      });

      return { success: data ? true : false };
    } catch (e) {
      return { success: false };
    }
  }

  public static async getEmptyFloors(siteId: string) {
    try {
      const allFloors: number[] = [];
      const popFloors: number[] = [];

      const allFloorsObj = await MinimapImages.find({
        site: new ObjectId(siteId),
      });

      for (const floor of allFloorsObj) {
        allFloors.push(floor.floor);
      }

      const popFloorsObj = await MinimapNode.find({
        site: new ObjectId(siteId),
      });

      for (const floor of popFloorsObj) {
        popFloors.push(floor.floor);
      }

      const emptyFloors = allFloors.filter((floor) => {
        if (!popFloors.includes(floor)) return floor;
      });

      return { success: true, emptyFloors: emptyFloors };
    } catch (e) {
      return { success: false };
    }
  }
}
