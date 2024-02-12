/* eslint-disable @typescript-eslint/no-unused-vars */
import StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../utils/ConsoleUtil";
// import path from "path";
import { Files, IDirectories, Directories } from "../models/ResourceModel";
import { ObjectId } from "bson";
import path = require("path");
import { Console } from "console";

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
  siteId: string,
  siteTag: string,
) => {
  const { TMP_FOLDER, MANTA_ROOT_FOLDER } = process.env;
  const fullDirPath =
    dirPath === "/"
      ? `${TMP_FOLDER}/${extractedFolder}`
      : `${TMP_FOLDER}/${extractedFolder}/${dirPath}`;
  const allFiles = await fs.readdir(fullDirPath);
  for (const currFile of allFiles) {
    if (currFile.startsWith("._")) continue;
    const fileStat = await fs.lstat(`${fullDirPath}/${currFile}`);
    if (fileStat.isDirectory()) {
      // Add Directory to the directories collection
      const directory = await new Directories({
        _id: new ObjectId(),
        name: currFile,
        parent: topLevelDirectory._id,
        site: siteId,
      });

      await directory.save();

      topLevelDirectory.subdirectories = [
        ...topLevelDirectory.subdirectories,
        directory._id,
      ];

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
      const file = await new Files({
        _id: new ObjectId(),
        name: currFile,
        url: `https://stluc.manta.uqcloud.net/${MANTA_ROOT_FOLDER}/drawings/${
          dirPath === "/" ? "" : `${dirPath}/`
        }${currFile}`,
        uploaded_at: new Date(),
        site: siteId,
      });

      await file.save();

      topLevelDirectory.files = [...topLevelDirectory.files, file._id];

      await topLevelDirectory.save();
    }
  }
};

// export const fileLoop = async (
//   dirPath: string,
//   topLevelDirectory: IDirectories,
//   extractedFolder: string,
//   siteId: string,
//   siteTag: string,
// ) => {
//   const { TMP_FOLDER, MANTA_ROOT_FOLDER } = process.env;
//   // const fullDirPath = path.join("/", TMP_FOLDER as string, dirPath);
//   const fullDirPath = path.join(
//     TMP_FOLDER as string,
//     extractedFolder,
//     dirPath === "/" ? "" : dirPath,
//   );

//   ConsoleUtil.log(`Current dir path: ${fullDirPath}`);

//   const allFiles = await fs.readdir(fullDirPath);

//   await Promise.all(
//     allFiles.map(async (currFile) => {
//       if (currFile.startsWith("._")) return;

//       const fileStat = await fs.lstat(path.join(fullDirPath, currFile));

//       if (fileStat.isDirectory()) {
//         const directory = await new Directories({
//           _id: new ObjectId(),
//           name: currFile,
//           parent: topLevelDirectory._id,
//           site: siteId,
//         });

//         await fileLoop(
//           path.join(dirPath, currFile),
//           directory,
//           extractedFolder,
//           siteId,
//           siteTag,
//         );

//         await directory.save();
//         topLevelDirectory.subdirectories.push(directory._id);

//         await topLevelDirectory.save();
//       } else {
//         // Add to files colelction and using the given directory,
//         // add association to the directory strucutre.
//         const file = await new Files({
//           _id: new ObjectId(),
//           name: currFile,
//           url: `https://stluc.manta.uqcloud.net/${MANTA_ROOT_FOLDER}/${siteTag}/Documents/${
//             dirPath === "/" ? "" : `${dirPath}/`
//           }${currFile}`,
//           uploaded_at: new Date(),
//           site: siteId,
//         });

//         await file.save();

//         topLevelDirectory.files.push(file._id);
//         await topLevelDirectory.save();
//       }
//     }),
//   );
// };
