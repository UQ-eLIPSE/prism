import * as stream from 'stream';
import * as multer from 'multer';
import * as manta from 'manta';
import * as fs from 'fs';
import { Request } from 'express-serve-static-core';
import { ConsoleUtil } from '../utils/ConsoleUtil';

export class MantaService implements multer.StorageEngine {
  private manta: manta.manta.MantaClient | null = null;

  public async setupManta() {
    try {
      const {
        MANTA_KEY_FILE,
        MANTA_KEY_ID,
        MANTA_USER,
        MANTA_SUB_USER,
        MANTA_ROLES,
        MANTA_HOST_NAME,
      } = process.env;

      this.manta = await manta.createClient({
        sign: manta.privateKeySigner({
          key: fs.readFileSync(MANTA_KEY_FILE as any, 'utf-8'),
          keyId: MANTA_KEY_ID,
          user: MANTA_USER,
          subuser: MANTA_SUB_USER,
          role: [MANTA_ROLES],
        }),

        user: MANTA_USER,
        subuser: MANTA_SUB_USER,
        url: MANTA_HOST_NAME,
        role: [MANTA_ROLES] as unknown as string[],
      });
    } catch (e) {
      ConsoleUtil.error(e);
    }
  }

  private async mkdirInManta(MANTA_ROOT_FOLDER: string, PROJECT_NAME: string) {
    return new Promise((resolve, reject) => {
      (<any>this.manta).mkdirp(
        `~~/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}`,
        (err: any, res: any) => {
          if (err) return reject(err);
          return resolve(res);
        },
      );
    });
  }

  private async uploadFileToManta(
    destPath: string,
    fileStream: stream.Readable,
  ) {
    return new Promise<any>((resolve, reject) => {
      (<manta.manta.MantaClient>this.manta).put(
        destPath,
        fileStream,
        {
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET',
          },
        },

        (err: any, res: any) => {
          console.log(err, res);
          if (err) return reject(err);
          return resolve(res);
        },
      );
    });
  }

  public async _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    try {
      const fileStream: stream.Readable = (file as any).stream;
      const { MANTA_ROOT_FOLDER, PROJECT_NAME } = process.env;
      const destPath = `~~/${MANTA_ROOT_FOLDER}/`;

      if (file.fieldname === 'resource') {
        if (!this.manta) {
          await this.setupManta();
        }

        await this.mkdirInManta(
          <string>MANTA_ROOT_FOLDER,
          <string>PROJECT_NAME,
        );
        await this.uploadFileToManta(<string>destPath, fileStream);
      }

      // At least return what was added
      return cb(null, {
        filename: file.originalname,
        fieldname: file.fieldname,
      });
    } catch (e) {
      return cb(e);
    }
  }

  public async _removeFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    try {
      if (this.manta) {
        const { PROJECT_NAME } = process.env;

        await new Promise((resolve, reject) => {
          (<manta.manta.MantaClient>this.manta).rmr(
            `~~/${PROJECT_NAME}/${file.originalname}`,
            (err: any, res: any) => {
              if (err) return reject(err);
              return resolve(res);
            },
          );
        });

        return cb(null, {
          fieldname: file.fieldname,
          filename: file.originalname,
        });
      }
    } catch (e) {
      cb(e);
    }
  }
}
