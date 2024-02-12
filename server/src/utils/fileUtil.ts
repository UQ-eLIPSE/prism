import StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../utils/ConsoleUtil";

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
      console.error(err);
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
