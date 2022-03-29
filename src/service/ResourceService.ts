import { CommonUtil } from "../utils/CommonUtil";
import { Response } from "express-serve-static-core";
import { Area, IArea, Resource } from "../models/ResourceModel";

export abstract class ResourceService {
  static async setResourceListPagination(
    maxResult: number,
    pageNo: number,
    size: number,
    res: Response,
    fieldToSearch: object = {}
  ) {
    let mongoQuery: any = {};

    mongoQuery.limit = size;
    mongoQuery.skip = size * pageNo - size;

    let allResource = await Resource.find(fieldToSearch, "-_id", mongoQuery)
      .populate("modifiedBy", "-_id -password -role")
      .populate("uploadedBy", "-_id -password -role")
      .populate("resourceType", "-_id")
      .populate("areaName", "-_id")
      .populate("category", "-_id")
      .populate("subcategory", "-_id");

    if (!allResource)
      return CommonUtil.failResponse(res, "No resource is found");

    const totalCount = await Resource.countDocuments(fieldToSearch);
    const nextPage =
      pageNo < Math.ceil(totalCount / size) ? pageNo + 1 : pageNo;

    return {
      currentPage: pageNo,
      pageSize: size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
      nextPage: nextPage,
      resources: allResource,
    };
  }
}
