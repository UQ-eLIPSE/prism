import { Request, Response, NextFunction } from "express";
import { SSO } from "@uq-elipse/uq-eait-sso";
import * as jwt from "jsonwebtoken";

import { CommonUtil } from "./CommonUtil";
import { InvitedUser, IUser, User } from "../models/UserModel";

export abstract class AuthUtil {
  /**
   * This function gets the EAIT_WEB cookie from the network request
   * @param req
   * @returns a string or undefined
   */
  static getTokenFromRequest(req: Request): undefined | string {
    return (req.cookies || {})["EAIT_WEB"];
  }

  /**
   * Using the SSO package, req is passed in to get the KVD payload information
   * @param req
   * @param res
   * @returns ssoPayload containing UQ information
   */
  static async getSSOUser(req: Request, res: Response) {
    const { AUTH_HOST } = process.env;
    const sso = new SSO(<string>AUTH_HOST);
    const token = this.getTokenFromRequest(req);
    if (!token) return CommonUtil.failResponse(res, "token is not found");

    const ssoPayload = await sso.getUserInfoPayload(token);
    if (!ssoPayload)
      return CommonUtil.failResponse(res, "Error, user info not found");

    return ssoPayload;
  }

  /**
   * Create User function
   * @param username
   * @returns Object with username and role
   */
  static async createUser(username: string) {
    const createUser: IUser = new User({
      username,
    });
    await createUser.save();
    return createUser;
  }

  /**
   * This function gets the users information from the EAIT_WEB cookie
   * @param req
   * @param res
   * @returns user information
   */
  static async getUserInfo(req: Request, res: Response) {
    const { user } = res.locals.user;
    const payload = await User.findOne({ username: user });
    return CommonUtil.successResponse(res, "", payload);
  }

  static generateToken(res: Response, username: string, id: string) {
    const { JWT_Hash, ENVIRONMENT } = process.env;
    const expiration = 2592000;
    const token = jwt.sign({ id, username }, <string>JWT_Hash, {
      expiresIn: ENVIRONMENT === "development" ? "1d" : "7d",
    });

    return res.cookie("loginToken", token, {
      expires: new Date(Date.now() + expiration),
      secure: false,
      httpOnly: true,
    });
  }

  // eslint-disable-next-line require-await
  static async authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    const { JWT_Hash } = process.env;
    const jwtToken = req.body.token;

    if (jwtToken) {
      res.locals.jwtToken = jwtToken;
      res.locals.jwtHash = JWT_Hash;
      res.locals.tokenType = req.body.forgotPassword;
      next();
    } else {
      if (!req.headers["x-kvd-payload"]) {
        res.locals.user = req.body;
        next();
      } else {
        const payload = await AuthUtil.getSSOUser(req, res);
        if (!payload)
          return CommonUtil.failResponse(res, "user details is not found");

        res.locals.user = payload;
        next();
      }
    }
  }

  static async verifyCookie(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    const token = req.headers["set-cookie"];
    const { JWT_Hash } = process.env;
    const userParams = req.params.username;

    if (!token)
      return CommonUtil.failResponse(
        res,
        "cookie verification failed, user is not authorized",
      );
    else {
      const loginToken = (<string[]>token)[0].split("=")[1].split(";")[0];
      await jwt.verify(
        loginToken,
        <string>JWT_Hash,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (err: any, decoded: any) => {
          if (err) return CommonUtil.failResponse(res, err);
          const username = decoded.username;
          const isUserFound = await User.findOne({ username });

          if (!isUserFound || userParams !== username)
            return CommonUtil.failResponse(
              res,
              "cookie fail, user is not authorized",
            );
          if (isUserFound.role === "guest")
            return CommonUtil.failResponse(
              res,
              "User does not have enough permission",
            );

          res.locals.user = isUserFound;
          next();
        },
      );
    }
  }

  static async validateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    const { jwtToken, jwtHash, tokenType } = res.locals;

    // decrypt jwtToken
    const userDetails = await jwt.verify(jwtToken, jwtHash, {
      algorithms: ["HS256"],
    });

    if (!tokenType) {
      const invitedUserInDb = await InvitedUser.findOne({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (<any>userDetails).email,
      });
      if (!invitedUserInDb)
        return CommonUtil.failResponse(res, "token is invalid");
      res.locals.user = userDetails;
      next();
    } else {
      const userInDb: IUser | null = await User.findOne({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (<any>userDetails).email,
      });

      if (!userInDb) return CommonUtil.failResponse(res, "token is invalid");
      const todayDate = new Date().getTime() / 1000;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (todayDate > (<any>userDetails).exp)
        return CommonUtil.failResponse(res, "token is expired");
      res.locals.user = userDetails;
      next();
    }
  }
}
