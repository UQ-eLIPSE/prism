import { Request, Response, NextFunction } from 'express';
import { SSO } from '@uq-elipse/uq-eait-sso';
import * as jwt from 'jsonwebtoken';

import { CommonUtil } from './CommonUtil';
import { InvitedUser, IUser, User } from '../models/UserModel';

export abstract class AuthUtil {
  public static getTokenFromRequest(req: Request): undefined | string {
    // Look through request to find EAIT_WEB cookie
    return (req.cookies || {})['EAIT_WEB'];
  }

  static async generateToken(res: Response, username: string, id: string) {
    const { JWT_Hash, ENVIRONMENT } = process.env;
    const expiration = ENVIRONMENT === 'development' ? 100 : 2592000;
    const token = jwt.sign({ id, username }, <string>JWT_Hash, {
      expiresIn: ENVIRONMENT === 'development' ? '1d' : '7d',
    });

    return res.cookie('loginToken', token, {
      expires: new Date(Date.now() + expiration),
      secure: false,
      httpOnly: true,
    });
  }

  static async authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    const { JWT_Hash, USE_SSO, AUTH_HOST } = process.env;
    const jwtToken = req.body.token;
    const useSSO = USE_SSO === 'true';

    if (jwtToken) {
      res.locals.jwtToken = jwtToken;
      res.locals.jwtHash = JWT_Hash;
      res.locals.tokenType = req.body.forgotPassword;
      next();
    } else {
      if (!useSSO) {
        res.locals.user = req.body;
        next();
      } else {
        const token: string | undefined = this.getTokenFromRequest(req);
        const sso = new SSO(<string>AUTH_HOST);
        if (!token) return CommonUtil.failResponse(res, 'token is not found');

        const payload = sso.getUserInfoPayload(<string>token);
        if (!payload)
          return CommonUtil.failResponse(res, 'user details is not found');

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
    const token = req.headers['set-cookie'];
    const { JWT_Hash } = process.env;
    const userParams = req.params.username;

    if (!token) return CommonUtil.failResponse(res, 'user is not authorized');
    else {
      const loginToken = (<string[]>token)[0].split('=')[1].split(';')[0];
      await jwt.verify(
        loginToken,
        <string>JWT_Hash,
        async (err: any, decoded: any) => {
          if (err) return CommonUtil.failResponse(res, err);
          const username = decoded.username;
          const isUserFound = await User.findOne({ username });

          if (!isUserFound || userParams !== username)
            return CommonUtil.failResponse(res, 'user is not authorized');
          if (isUserFound.role === 'guest')
            return CommonUtil.failResponse(
              res,
              'User does not have enough permission',
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
      algorithms: ['HS256'],
    });

    if (!tokenType) {
      const invitedUserInDb = await InvitedUser.findOne({
        email: (<any>userDetails).email,
      });
      if (!invitedUserInDb)
        return CommonUtil.failResponse(res, 'token is invalid');
      res.locals.user = userDetails;
      next();
    } else {
      const userInDb: IUser | null = await User.findOne({
        email: (<any>userDetails).email,
      });

      if (!userInDb) return CommonUtil.failResponse(res, 'token is invalid');
      const todayDate = new Date().getTime() / 1000;
      if (todayDate > (<any>userDetails).exp)
        return CommonUtil.failResponse(res, 'token is expired');
      res.locals.user = userDetails;
      next();
    }
  }
}
