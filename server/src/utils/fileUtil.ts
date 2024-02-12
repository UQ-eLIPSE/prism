/* eslint-disable @typescript-eslint/no-unused-vars */
import StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../utils/ConsoleUtil";
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

const createAndSaveDirectory = async (
  currFile: string,
  topLevelDirectoryId: ObjectId,
  siteId: string,
) => {
  const directory = new Directories({
    _id: new ObjectId(),
    name: currFile,
    parent: topLevelDirectoryId,
    site: siteId,
  });

  await directory.save();

  return directory;
};

const createAndSaveFile = async (
  currFile: string,
  dirPath: string,
  siteId: string,
  MANTA_ROOT_FOLDER: string,
) => {
  const file = new Files({
    _id: new ObjectId(),
    name: currFile,
    url: `https://stluc.manta.uqcloud.net/${MANTA_ROOT_FOLDER}/drawings/${
      dirPath === "/" ? "" : `${dirPath}/`
    }${currFile}`,
    uploaded_at: new Date(),
    site: siteId,
  });

  await file.save();

  return file;
};

export const fileLoop = async (
  dirPath: string,
  topLevelDirectory: IDirectories,
  extractedFolder: string,
  siteId: string,
  siteTag: string,
) => {
  const { TMP_FOLDER, MANTA_ROOT_FOLDER } = process.env;

  const fullDirPath = path.join(
    "./",
    TMP_FOLDER as string,
    extractedFolder,
    dirPath === "/" ? "" : dirPath,
  );
  ConsoleUtil.log(`Reading directory: ${fullDirPath}`);

  const allFiles = await fs.readdir(fullDirPath);

  for (const currFile of allFiles) {
    if (currFile.startsWith("._")) continue;
    const fileStat = await fs.lstat(`${fullDirPath}/${currFile}`);
    if (fileStat.isDirectory()) {
      // Add Directory to the directories collection

      const directory = await createAndSaveDirectory(
        currFile,
        topLevelDirectory._id,
        siteId,
      );

      topLevelDirectory.subdirectories.push(directory._id);

      await topLevelDirectory.save();

      await fileLoop(
        `${dirPath}/${currFile}`,
        directory,
        extractedFolder,
        siteId,
        siteTag,
      );
    } else {
      // Add to files collection and using the given directory,
      // add association to the directory structure.

      const file = await createAndSaveFile(
        currFile,
        dirPath,
        siteId,
        MANTA_ROOT_FOLDER as string,
      );

      await file.save();

      topLevelDirectory.files.push(file._id);

      await topLevelDirectory.save();
    }
  }
};
