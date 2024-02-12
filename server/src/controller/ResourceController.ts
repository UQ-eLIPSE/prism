import { Request, Response } from "express";
import { CommonUtil } from "../utils/CommonUtil";
import { MantaService } from "../service/MantaService";
import {
  Area,
  Type,
  Category,
  Subcategory,
  Resource,
  Files,
  IDirectories,
  Directories,
  IFiles,
  About,
} from "../models/ResourceModel";
import * as multer from "multer";
import { ResourceService } from "../service/ResourceService";
import { ObjectId } from "bson";
import { Site } from "../components/Site/SiteModel";
import StreamZip = require("node-stream-zip");
import { ConsoleUtil } from "../utils/ConsoleUtil";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import { fileLoop } from "../utils/fileUtil";

export class ResourceController {
  public mantaService: MantaService;
  public uploadFile: multer.Multer;

  constructor() {
    const limits = { fileSize: 1024 * 1024 * 1024 };

    this.mantaService = new MantaService();
    this.uploadFile = multer({
      limits: limits,
      storage: this.mantaService,
    });
  }

  public async UploadDocumentation(req: Request, res: Response) {
    const { files } = req;
    const {
      TMP_FOLDER,
      MANTA_HOST_NAME,
      MANTA_USER,
      MANTA_ROOT_FOLDER,
      MANTA_ROLES,
      MANTA_KEY_ID,
      MANTA_SUB_USER,
    } = process.env;

    const { zipFile } = files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const { siteId } = req.params;
    if (!siteId) throw new Error("Site Id is not provided");
    if (!files) throw new Error("File is undefined");
    //  Get site
    const site = await Site.findById({ _id: new ObjectId(siteId) });
    if (!site) throw new Error("Invalid Site Id");

    // Create a zip stream for the zip file.
    const zip = new StreamZip({
      file: `${TMP_FOLDER}/${zipFile[0].filename}`,
      storeEntries: true,
    });

    // Folder without .zip ext
    const extractedFolder = zipFile[0].filename.replace(".zip", "");

    zip.on("error", (err: string) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });

    // Extract the zip file.
    const zipOp = await new Promise((resolve, reject) => {
      zip.on("ready", () => {
        // Extract zip
        zip.extract(null, `${TMP_FOLDER}/${extractedFolder}`, (err: string) => {
          ConsoleUtil.error(err ? "Extract error" : "Extracted");
          zip.close();

          err ? reject() : resolve("Extracted");
        });
      });
    });

    if (!zipOp) return;

    // Upload the files to Manta.
    const upload = execSync(
      // eslint-disable-next-line max-len
      `manta-sync ${TMP_FOLDER}/${extractedFolder} /${MANTA_ROOT_FOLDER}/${site.tag}/Documents/ --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`,
      { encoding: "utf-8", maxBuffer: 200 * 1024 * 1024 },
    );

    if (!upload) return CommonUtil.failResponse(res, "Failed to upload files.");

    const existingTopLevelDirectory = await Directories.findOne({
      parent: { $exists: false },
      site: siteId,
    });
    const originalDirFolder = new Directories({
      _id: new ObjectId(),
      name: "drawings",
      site: siteId,
    });

    await fileLoop(
      "/",
      existingTopLevelDirectory ? existingTopLevelDirectory : originalDirFolder,
      extractedFolder,
      siteId,
      site.tag,
    );

    if (!existingTopLevelDirectory) {
      await originalDirFolder.save();
    }

    return CommonUtil.successResponse(res, "Resource Endpoint is successful.");
  }

  /**
   *
   * @param err - Multer error message
   * @param req
   * @param res
   */
  public async createNewResource(
    req: Request,
    res: Response,
    err: { code: string },
  ) {
    const { file } = req;
    const { MANTA_HOST_NAME, MANTA_USER, MANTA_ROOT_FOLDER, PROJECT_NAME } =
      process.env;

    if (!file) return CommonUtil.failResponse(res, "File is not found");
    if (err.code === "LIMIT_FILE_SIZE")
      return CommonUtil.failResponse(
        res,
        "File is too big. Max file size is 1GB",
      );

    const uploadedAt = new Date().getTime();
    const uploadedBy = res.locals.user._id;
    const name = file.filename;
    const contentType = file.mimetype;
    const url = `${MANTA_HOST_NAME}/${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${name}`;

    const newResource = await new Resource({
      uploadedAt,
      uploadedBy,
      name,
      contentType,
      url,
    });
    await newResource.save();

    return CommonUtil.successResponse(res, "", newResource);
  }

  /** *
   * Update Resource
   * @param req
   * @param res
   */
  public async updateResource(req: Request, res: Response) {
    const { id } = req.params;
    const isResourceFound = Resource.findById(id);
    const { description, areaName, category, subcategory, resourceType } =
      req.body;
    const modifiedAt = new Date().getTime().toString();

    if (!isResourceFound)
      return CommonUtil.failResponse(res, "Resource is not found");
    await Resource.findByIdAndUpdate(id, {
      description,
      areaName,
      category,
      subcategory,
      resourceType,
      modifiedBy: res.locals.user._id,
      modifiedAt,
    });

    return CommonUtil.successResponse(
      res,
      "Resource has been successfully updated",
    );
  }

  /**
   * Get all resources
   * @param req
   * @param res
   */
  public async getAllResources(req: Request, res: Response) {
    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const size = parseInt(req.query.size as any) || maxResult;
    const { siteId } = req.params;
    if (!siteId) return CommonUtil.failResponse(res, "Site Id is not provided");

    const allResources = await ResourceService.setResourceListPagination(
      maxResult,
      pageNo,
      size,
      res,
      {
        site: new ObjectId(siteId),
      },
    );

    return CommonUtil.successResponse(res, "", allResources);
  }

  /**
   * Search resources by file name, description, area, category, sub-category,
   * type, modified by, last updated
   * @param req
   * @param res
   */
  public async searchResources(req: Request, res: Response) {
    const { query } = req.query;

    const searchRegex = new RegExp(escape(query as string), "gi");

    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;

    const fieldToSearchCount = {
      fileName: searchRegex,
      description: searchRegex,
      areaName: searchRegex,
      category: searchRegex,
      subcategory: searchRegex,
      resourceType: searchRegex,
      contentType: searchRegex,
      uploadedAt: searchRegex,
      uploadedBy: searchRegex,
      modifiedAt: searchRegex,
      modifiedBy: searchRegex,
    };

    const results = await ResourceService.setResourceListPagination(
      maxResult,
      pageNo,
      size,
      res,
      fieldToSearchCount,
    );
    return CommonUtil.successResponse(res, "", results);
  }

  /**
   * Create new area
   * @param req
   * @param res
   */
  public async createNewArea(req: Request, res: Response) {
    const { name, description } = req.body;

    if (!name) return CommonUtil.failResponse(res, "Area name is required");

    const newArea = await new Area({ name, description });
    await newArea.save();

    return CommonUtil.successResponse(
      res,
      "New area has been successfully created",
    );
  }

  /**
   * Get all resource areas
   * @param req
   * @param res
   */
  public async getAllResourceAreas(req: Request, res: Response) {
    const allAreas = await Area.find({});
    return CommonUtil.successResponse(res, "", allAreas);
  }

  /**
   * Create new type
   * @param req
   * @param res
   */
  public async createNewType(req: Request, res: Response) {
    const { name, description } = req.body;
    if (!name) return CommonUtil.failResponse(res, "Type name is required");

    const newType = await new Type({ name, description });
    await newType.save();

    return CommonUtil.successResponse(
      res,
      "New type has been successfully created",
    );
  }

  /**
   * Get all resource types
   * @param req
   * @param res
   */
  public async getAllResourceTypes(req: Request, res: Response) {
    const allTypes = await Type.find({});
    return CommonUtil.successResponse(res, "", allTypes);
  }

  /**
   * Create new category
   * @param req
   * @param res
   */
  public async createNewCategory(req: Request, res: Response) {
    const { name, subcategories } = req.body;

    const newCategory = await new Category({ name, subcategories });
    await newCategory.save();

    return CommonUtil.successResponse(
      res,
      "New category has been successfully created",
    );
  }

  /**
   * Get all categories
   * @param req
   * @param res
   */
  public async getAllCategories(req: Request, res: Response) {
    const allCats = await Category.find();
    return CommonUtil.successResponse(res, "", allCats);
  }

  /**
   * Create new subcategory
   * @param req
   * @param res
   */
  public async createNewSubcategory(req: Request, res: Response) {
    const { name, parentCategories } = req.body;

    const newSubcategories = await new Subcategory({
      name,
      parentCategories,
    });
    await newSubcategories.save();

    if (parentCategories.length) {
      for (const category of parentCategories) {
        const parentCategories = await Category.findById(category);
        if (!parentCategories)
          return CommonUtil.failResponse(res, "Parent category is not found");

        parentCategories.subcategories.push(newSubcategories._id);
        await parentCategories.save();
      }
    }

    return CommonUtil.successResponse(
      res,
      "New subcategory has been successfully created",
    );
  }

  /**
   * Get all subcategories
   * @param req
   * @param res
   */
  public async getAllSubcategories(req: Request, res: Response) {
    const allSubcats = await Subcategory.find();
    return CommonUtil.successResponse(res, "", allSubcats);
  }

  /**
   * Get all documentation
   * @param req
   * @param res
   */
  public async getAllDocumentation(req: Request, res: Response) {
    const { siteId } = req.params;
    if (!siteId) return CommonUtil.failResponse(res, "Site Id is not provided");
    const allDocumentation = await Files.find({
      site: new ObjectId(siteId),
    });
    return CommonUtil.successResponse(res, "", allDocumentation);
  }

  /**
   * Get documentation based on id
   * @param req
   * @param res
   */
  public async getIndividualDocumentation(req: Request, res: Response) {
    const { _id } = req.query;
    let docObject: IFiles | null = null;

    try {
      docObject = await Files.findOne({ _id }, "-_id");
      if (!docObject) throw new Error("docObject not found.");
      return CommonUtil.successResponse(res, "", docObject || []);
    } catch (e) {
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Query Directory based on id or name
   * @param req
   * @param res
   */
  public async getIndividualDirectory(req: Request, res: Response) {
    const { _id, name } = req.query;
    let dirObject: IDirectories | null = null;

    try {
      if (_id) {
        dirObject = await Directories.findOne({ _id }, "-_id");
      } else if (name) {
        dirObject = await Directories.findOne({ name }, "-_id");
      }
      if (!dirObject) throw new Error("dirObject not found.");

      return CommonUtil.successResponse(res, "", dirObject || []);
    } catch (e) {
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Query Directory root directory (with no parent)
   * @param req
   * @param res
   */
  public async getRootDirectory(req: Request, res: Response) {
    const { siteId } = req.params;
    try {
      if (!siteId) throw new Error("Site Id is not provided");

      const dirObject = await Directories.findOne({
        parent: { $exists: false },
        site: new ObjectId(siteId),
      });

      if (!dirObject) throw new Error("dirObject not found.");

      return CommonUtil.successResponse(res, "", dirObject || []);
    } catch (e) {
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Query About info
   * @param req
   * @param res
   */
  public async getAboutInfo(req: Request, res: Response) {
    const { siteId } = req.params;
    try {
      if (!siteId) throw new Error("Site Id is not provided");
      const aboutInfo = await About.findOne({
        site: new ObjectId(siteId),
      });

      if (!aboutInfo) throw new Error("About info not found.");

      return CommonUtil.successResponse(res, "", aboutInfo || []);
    } catch (e) {
      return CommonUtil.failResponse(res, e.message || e);
    }
  }
}
