import StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../utils/ConsoleUtil";
import { Files, IDirectories, Directories } from "../models/ResourceModel";
import { ObjectId } from "bson";
import path = require("path");

/**
 * A helper function to extract the zip file.
 * @param zip - The zip file
 * @param extractedFolder - The extracted folder name
 * @param TMP_FOLDER - The tmp folder path from env
 * @returns {Promise<boolean>} - Whether the extraction was successful or not
 */
export const extractZipFile = async (
  zip: StreamZip,
  extractedFolder: string,
  TMP_FOLDER: string,
): Promise<boolean> => {
  // Ensure the target extraction directory exists
  await fs.mkdir(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });
  try {
    await new Promise((resolve, reject) => {
      zip.on("error", (err: string) => {
        ConsoleUtil.error(err);
        reject(err);
      });

      // Extract the zip file.
      zip.on("ready", () => {
        // Extract zip
        zip.extract(null, `${TMP_FOLDER}/${extractedFolder}`, (err: string) => {
          err ? ConsoleUtil.error(err) : ConsoleUtil.success("Extracted");
          zip.close();

          err ? reject(err) : resolve("Extracted");
        });
      });
    });
    return true;
  } catch (error) {
    return false;
  }
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

/**
 * A recursive function that loops through the extracted folder and creates
 * a directory structure in the database.
 * @param dirPath - The current directory path
 * @param topLevelDirectory - The top level directory object
 * @param extractedFolder - The extracted folder name
 * @param siteId - The site id
 * @param siteTag - The site tag
 */
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
