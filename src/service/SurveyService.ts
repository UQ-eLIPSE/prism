/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express-serve-static-core';
import { ISite, SiteSettings } from '../components/Site/SiteModel';
import {
  SurveyNode,
  MinimapConversion,
  MinimapNode,
  Survey,
  MinimapImages,
} from '../models/SurveyModel';
import { CommonUtil } from '../utils/CommonUtil';
import * as fs from 'fs/promises';
import csv = require('csvtojson');
import process = require('process');
import { execSync } from 'child_process';
import { ObjectId } from 'bson';
import { uploadZipManta } from '../utils/mantaUtil';
import { ConsoleUtil } from '../utils/ConsoleUtil';
const StreamZip = require('node-stream-zip');

interface CSVProperties {
  level?: string;
  title?: string;
  fileName: string;
  x: string;
  y: string;
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
        zipFile[0].mimetype !== 'application/zip' &&
        properties[0].mimetype !== 'text/csv'
      )
        throw new Error('Invalid file types');

      // Create a zip stream for the zip file.
      const zip = new StreamZip({
        file: `${zipFile[0].path}`,
        storeEntries: true,
      });

      // Folder without .zip ext
      const extractedFolder = zipFile[0].filename.replace('.zip', '');

      zip.on('error', (err: any) => {
        console.error(err);
      });

      // Get Open CSV and convert to JSON.
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error('Incorrect CSV format');

      // eslint-disable-next-line no-async-promise-executor
      const zipOp = await new Promise(async (resolve, reject) => {
        await zip.on('ready', async () => {
          const entries = Object.values(zip.entries());

          // Check if the images exist
          for (const field of csvJSON) {
            const checkImageExist = entries.some((entry: any) =>
              entry.name.includes(`${field.fileName}`),
            );
            if (!checkImageExist)
              reject(
                'Image does not exist, please upload your CSV file again with the correct file name.',
              );
          }

          // Check Marzipano app files exist
          const appFilesExist = entries.some(
            (entry: any) =>
              entry.name.endsWith('app-files/') && entry.isDirectory,
          );

          // Check Data.js exists as part of the Marzipano zip.
          const dataJsExist = entries.some((entry: any) =>
            entry.name.includes('app-files/data.js'),
          );

          if (!appFilesExist || !dataJsExist)
            reject('Marzipano folder structure is not correct');

          // Extract zip
          await zip.extract(
            null,
            `${process.env.TMP_FOLDER}/${zipFile[0].filename.replace(
              '.zip',
              '',
            )}`,
            (err: any) => {
              ConsoleUtil.error(err ? 'Extract error' : 'Extracted');
              zip.close();

              err ? reject() : resolve('Extracted');
            },
          );
        });
      });

      if (!zipOp) throw new Error('Zip op failed');

      // Check data.js and match the tile names
      const readData = await fs.readFile(
        `${process.env.TMP_FOLDER}/${zipFile[0].filename.replace(
          '.zip',
          '',
        )}/app-files/data.js`,
        'utf-8',
      );

      // Check file name against the tiles.
      for (const field of csvJSON) {
        if (!readData.includes(field.fileName))
          throw new Error('Image does not exist in the Marzipano zip file.');
      }

      // Upload tiles to Manta using Manta-Sync
      const uploadZip = await uploadZipManta(extractedFolder, site.tag);
      if (!uploadZip) return false;

      return true;
    } catch (e) {
      ConsoleUtil.error(e.message);
      return false;
    }
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
  ) {
    try {
      const { zipFile, properties } = files;
      // Convert CSV to JSON
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error('Incorrect CSV format');
      const { MANTA_HOST_NAME, MANTA_ROOT_FOLDER, TMP_FOLDER } = process.env;

      const extractedFolder = zipFile[0].filename.replace('.zip', '');

      // Read from data.js
      const dataJS = await fs.readFile(
        `${TMP_FOLDER}/${extractedFolder}/app-files/data.js`,
        'utf8',
      );

      if (!dataJS) throw new Error('Cannot read data.js');

      const stringedJSONData = dataJS
        .replace('var APP_DATA = ', '')
        .replace(/;/g, '');

      const data = JSON.parse(stringedJSONData);

      if (!data.scenes) throw new Error('Scenes are not available');

      const scenes: any[] = data.scenes;

      // Upload data to DB
      // eslint-disable-next-line no-async-promise-executor
      const uploadData = await new Promise(async (resolve, reject) => {
        await scenes.forEach(async (scene, i) => {
          // Get CSV Element using the scene ID.
          const specElem = csvJSON.find((el) => el.fileName === scene.id);

          // Upload Survey Nodes from DataJS
          const survey = await SurveyNode.create([
            {
              _id: new ObjectId(),
              info_hotspots: scene.infoHotspots,
              link_hotspots: scene.linkHotspots,
              levels: scene.levels,
              face_size: scene.faceSize,
              initial_parameters: scene.initialViewParameters,
              manta_link: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${site.tag}/`,
              node_number: i,
              survey_name: scene.name,
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              date: '2021-11-16T00:00:00.000+10:00',
              site: new ObjectId(site._id),
            },
          ]);

          if (!survey) reject("Survey couldn't be uploaded");

          // Upload to minimap nodes
          const minimapNode = await MinimapNode.create([
            {
              _id: new ObjectId(),
              floor: specElem?.level ? specElem.level : 0,
              node_number: i,
              survey_node: new ObjectId(survey[0]._id),
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              site: new ObjectId(site._id),
            },
          ]);

          if (!minimapNode) reject('Minimap Node cannot be uploaded');

          // Upload Minimap conversions with the provided x/y coords from the CSV

          const minimapConversion = await MinimapConversion.create([
            {
              _id: new ObjectId(),
              floor: specElem?.level ? specElem.level : 0,
              minimap_node: new ObjectId(minimapNode[0]._id),
              survey_node: new ObjectId(survey[0]._id),
              x: specElem?.x,
              x_scale: 1,
              y: specElem?.y,
              y_scale: 1,
              site: new ObjectId(site._id),
            },
          ]);

          if (!minimapConversion)
            reject('Minimap conversion cannot be uploaded.');

          // Link/Info Hotspots if included *TODO in different ticket*
        });

        // Add Site Settings
        // NOTE: These values need to be created as part of sceen process.
        await SiteSettings.create({
          _id: new ObjectId(),
          enable: {
            timeline: false,
            rotation: true,
            media: false,
            faq: false,
            documentation: false,
            floors: false,
            about: false,
            animations: false,
          },
          initial_settings: {
            date: '2021-11-16T00:00:00.000+10:00',
            floor: 0,
            pano_id: '',
            yaw: 0,
            pitch: 0,
            fov: 0,
            // Half of Pi
            rotation_offset: 1.5707963267948966,
          },
          minimap: {
            image_url: '',
            image_large_url: '',
            x_pixel_offset: 0,
            y_pixel_offset: 0,
            x_scale: 1,
            y_scale: 1,
            img_width: 0,
            img_height: 0,
            xy_flipped: false,
          },
          animation: {
            url: 'NA',
            title: 'NA',
          },
          sidenav: {
            logo_url: 'https://picsum.photos/20/20',
            subtitle_url: 'https://picsum.photos/20/20',
          },
          display: {
            title: site.site_name,
            subtitle: site.site_name,
          },
          marzipano_mouse_view_mode: 'drag',
          num_floors: 0,
          site: new ObjectId(site._id),
        });

        resolve('Data Uploaded');
      });

      if (!uploadData) throw new Error('Data could not be uploaded.');

      // Delete files and folder
      await fs.unlink(properties[0].path);
      await fs.unlink(zipFile[0].path);
      await fs.rm(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });

      return true;
    } catch (e) {
      ConsoleUtil.error(e.message);
      return false;
    }
  }

  static async readFileData(userDetails: any, entries: any, zip: any) {
    const dataJs = entries.filter((entry: any) =>
      entry.name.endsWith('/data.js'),
    );
    let marzipanoData: any;
    const surveyNodeIds = new Set();
    const outputFile: any = [];

    const { MANTA_ROOT_FOLDER, PROJECT_NAME, MANTA_USER, MANTA_HOST_NAME } =
      process.env;
    return new Promise((resolve, reject) => {
      for (const data of dataJs) {
        zip.stream((<any>data).name, (err: any, stream: any) => {
          stream.on('data', (chunk: any) => {
            outputFile.push(chunk);
          });

          stream.on('end', async () => {
            marzipanoData = Buffer.concat(outputFile).toString('utf8');
            if (marzipanoData) {
              marzipanoData = marzipanoData.split('=')[1].replace(';', '');
              marzipanoData = JSON.parse(marzipanoData);

              const newSurvey = new Survey({ surveyName: marzipanoData.name });
              await newSurvey.save();

              for (let idx = 0; idx < marzipanoData.scenes.length; idx++) {
                const date = new Date().getTime();
                const newSurveyNode = new SurveyNode({
                  surveyName: marzipanoData.name,
                  uploadedAt: date,
                  uploadedBy: userDetails['username'],
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
                  { $push: { surveyNodes: newSurveyNode._id } },
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
          stream.on('error', reject);
        });
      }
    });
  }

  static async readSurveyJson(entries: any, zip: any) {
    const surveyJson = entries.filter((entry: any) =>
      entry.name.endsWith('survey.json'),
    );
    let minimapData: any;

    return new Promise((resolve, reject) => {
      zip.stream((<any>surveyJson)[0].name, (err: any, stream: any) => {
        stream.on('data', async (chunk: any) => {
          minimapData = chunk.toString('utf8');
          if (minimapData) {
            minimapData = JSON.parse(minimapData);
            resolve(minimapData);
          }
        });

        stream.on('end', () => zip.close());
        stream.on('error', reject);
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
    if (!allSurveys) return CommonUtil.failResponse(res, 'No survey is found');

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
    return new Promise(async (resolve) => {
      zip.extract(null, destPath, (err: any) => {
        console.log(err ? 'Extract error' : `Extracted entries`);
        zip.close();
        resolve('');
      });
    });
  }

  public static async updateNodeCoordinates(
    nodeId: string,
    x: number,
    y: number
  ) {
    const updateNodeCoords = await MinimapConversion.findOneAndUpdate(
      { survey_node: new ObjectId(nodeId) },
      {
        x: x,
        y: y,
      },
    );

    return (updateNodeCoords ? true : false);
  }

  public static async updateNodeRotation(
    nodeId: string,
    rotation: number
  ) {
    const updateNodeRotation = await MinimapConversion.findOneAndUpdate(
      { survey_node: new ObjectId(nodeId) },
      {
        rotation: rotation,
      },
    );

    return (updateNodeRotation ? true : false);
  }

  /**
   * createSiteMap - - Inserts Site Map in to site Settings and upload
   * to Manta.
   * @param file - Uploaded file
   * @param site - Provided Site
   * @returns
   */
  public static async createSiteMap(
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
      if (file === undefined) throw new Error('File is undefined');

      // Upload on to Manta
      const upload = execSync(
        `mput -f ${file.path} ${MANTA_ROOT_FOLDER} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --keyId=${MANTA_KEY_ID} --role=${MANTA_ROLES} --url=${MANTA_HOST_NAME}`,
      );

      if (!upload) throw new Error("Site map couldn't be uploaded.");

      const getCurrentSiteMap = await MinimapImages.findOne(
        { floor, site: new ObjectId(site._id) },
        '-_id',
      );

      const saveSiteMap = getCurrentSiteMap
        ? await MinimapImages.findOneAndUpdate(
          { site: site._id },
          {
            image_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
            image_large_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
          },
        )
        : await MinimapImages.create({
          _id: new ObjectId(),
          image_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
          image_large_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
          floor: floor,
          site: site._id,
          x_pixel_offset: 0,
          y_pixel_offset: 0,
          x_scale: 1,
          y_scale: 1,
          img_width: 1000,
          img_height: 1000,
          xy_flipped: false,
        });

      if (!saveSiteMap) throw new Error('Site Map Cannot Be Saved');

      // Delete file from local tmp.
      await fs.unlink(file.path);

      return {
        success: true,
        message: 'Site Map has been saved',
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  }
}
