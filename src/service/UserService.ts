import { User } from '../models/UserModel';
import { CommonUtil } from '../utils/CommonUtil';
import { Response } from 'express-serve-static-core';

export abstract class UserService {
  static async setUserListPagination(
    maxResult: number,
    pageNo: number,
    size: number,
    fieldToSearch: object,
    res: Response,
  ) {
    const mongoQuery: any = {};

    mongoQuery.limit = size;
    mongoQuery.skip = size * pageNo - size;

    const allUsers = await User.find(fieldToSearch, {}, mongoQuery);
    if (!allUsers) return CommonUtil.failResponse(res, 'No user is found');

    const totalCount = await User.countDocuments(fieldToSearch);
    const nextPage =
      pageNo < Math.ceil(totalCount / size) ? pageNo + 1 : pageNo;

    return {
      currentPage: pageNo,
      pageSize: size,
      totalPages: Math.ceil(totalCount / size),
      nextPage: nextPage,
      users: allUsers,
    };
  }
}
