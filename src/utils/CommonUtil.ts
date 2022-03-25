import { Response } from 'express-serve-static-core';

export interface IResponse<PayloadType> {
  success: boolean;
  payload?: PayloadType;
  message: string;
}

export abstract class CommonUtil {
  public static failResponse<T>(res: Response, message: string): Response {
    return res.status(400).json(<T>(<any>{
      success: false,
      message: message,
    }));
  }

  public static successResponse<T>(res: Response, message: string, payload?: any): Response {
    return res.status(200).json(<T>(<any>{
      success: true,
      payload: payload,
      message: message,
    }));
  }

  public static interfaceKeyChecker<T, K extends keyof T>(object: T, key: K) {
    return object[key];
  }

  public static isInternalUser(email: string) {
    return email.includes('uq.edu.au');
  }
}
