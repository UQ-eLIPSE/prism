import StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../utils/ConsoleUtil";
// import path from "path";
import { Files, IDirectories, Directories } from "../models/ResourceModel";
import { ObjectId } from "bson";
import path = require("path");

export const extractZipFile = async (
  zip: StreamZip,
  extractedFolder: string,
  TMP_FOLDER: string | undefined,
): Promise<boolean> => {
  // Ensure the target extraction directory exists
  await fs.mkdir(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });

  const zipOp = new Promise((resolve, reject) => {
    zip.on("error", (err: string) => {
      // eslint-disable-next-line no-console
      ConsoleUtil.error(err);
    });

    // Extract the zip file.
    zip.on("ready", () => {
      // Extract zip
      zip.extract(null, `${TMP_FOLDER}/${extractedFolder}`, (err: string) => {
        ConsoleUtil.error(err ? "Extract error" : "Extracted");
        zip.close();

        err ? reject() : resolve("Extracted");
      });
    });
  });

  return !zipOp ? false : true;
};

const createDirectory = async (name: string, parentId: ObjectId) => {
  const directory = new Directories({
    _id: new ObjectId(),
    name,
    parent: parentId,
  });

  await directory.save();
  return directory;
};

const createFile = async (name: string, url: string) => {
  const file = new Files({
    _id: new ObjectId(),
    name,
    url,
    uploaded_at: new Date(),
  });

  await file.save();
  return file;
};

export const fileLoop = async (
  dirPath: string,
  topLevelDirectory: IDirectories,
  extractedFolder: string,
  siteTag: string,
  env: NodeJS.ProcessEnv,
) => {
  const { MANTA_ROOT_FOLDER, TMP_FOLDER } = env;
  const fullDirPath = path.join(TMP_FOLDER as string, extractedFolder, dirPath);
  const allFiles = await fs.readdir(fullDirPath);

  await Promise.all(
    allFiles.map(async (currFile) => {
      if (currFile.startsWith("._")) return;

      const fileStat = await fs.lstat(path.join(fullDirPath, currFile));

      if (fileStat.isDirectory()) {
        const directory = await createDirectory(
          currFile,
          topLevelDirectory._id,
        );
        topLevelDirectory.subdirectories.push(directory._id);
        await fileLoop(
          path.join(dirPath, currFile),
          directory,
          extractedFolder,
          siteTag,
          env,
        );
      } else {
        const fileUrl = `https://stluc.manta.uqcloud.net/${MANTA_ROOT_FOLDER}/${siteTag}/Documents/${
          dirPath === "/" ? "" : `${dirPath}/`
        }${currFile}`;
        const file = await createFile(currFile, fileUrl);
        topLevelDirectory.files.push(file._id);
      }
    }),
  );
};
