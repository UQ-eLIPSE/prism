import { Response } from "express-serve-static-core";

export interface IResponse<PayloadType> {
  success: boolean;
  payload?: PayloadType;
  message: string;
}

export abstract class CommonUtil {
  public static failResponse<T>(res: Response, message: string): Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(400).json(<T>(<any>{
      success: false,
      message: message,
    }));
  }

  public static successResponse<T>(
    res: Response,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
  ): Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return email.includes("uq.edu.au");
  }
}
