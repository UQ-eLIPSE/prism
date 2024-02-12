/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jt from "@jest/globals";
import { extractZipFile } from "../src/utils/fileUtil";
import * as fs from "fs";
// import StreamZip from "node-stream-zip";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");
import { ConsoleUtil } from "../src/utils/ConsoleUtil";

const { describe, test, it, expect, beforeEach } = jt;

describe("sum module", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(1 + 2).toBe(3);
  });
});

jt.jest.mock("fs", () => ({
  mkdir: jt.jest.fn((path, options, callback: any) => callback(null)),
  // Mock other fs methods if necessary
}));

// jt.jest.mock("fs/promises");

describe("extractZipFile", () => {
  let zip: typeof StreamZip;
  const extractedFolder = "extractedFolder";
  const TMP_FOLDER = "tmpFolder";

  beforeEach(() => {
    (fs.promises.mkdir as jt.jest.Mock).mockImplementation(() =>
      Promise.resolve(),
    );
    zip = {
      on: jt.jest.fn((event, callback: any) => {
        if (event === "ready") {
          callback();
        }
      }),
      extract: jt.jest.fn((entry, target, callback: any) => {
        callback(null);
      }),
      close: jt.jest.fn(),
    };

    ConsoleUtil.error = jt.jest.fn();
  });

  it("should extract zip file successfully", async () => {
    const result = await extractZipFile(zip, extractedFolder, TMP_FOLDER);

    expect(fs.mkdir).toHaveBeenCalledWith(`${TMP_FOLDER}/${extractedFolder}`, {
      recursive: true,
    });
    expect(zip.on).toHaveBeenCalledTimes(2);
    expect(zip.extract).toHaveBeenCalledWith(
      null,
      `${TMP_FOLDER}/${extractedFolder}`,
      expect.any(Function),
    );
    expect(zip.close).toHaveBeenCalled();
    expect(ConsoleUtil.error).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should handle errors during extraction", async () => {
    zip.extract = jt.jest.fn((entry, target, callback: any) => {
      callback("error");
    });

    try {
      await extractZipFile(zip, extractedFolder, TMP_FOLDER);
    } catch (e) {
      expect(fs.mkdir).toHaveBeenCalledWith(
        `${TMP_FOLDER}/${extractedFolder}`,
        { recursive: true },
      );
      expect(zip.on).toHaveBeenCalledTimes(2);
      expect(zip.extract).toHaveBeenCalledWith(
        null,
        `${TMP_FOLDER}/${extractedFolder}`,
        expect.any(Function),
      );
      expect(zip.close).toHaveBeenCalled();
      expect(ConsoleUtil.error).toHaveBeenCalledWith("Extract error");
    }
  });
});

// jt.jest.mock("fs", () => ({
//   open: jt.jest.fn(),
// }));

// jt.jest.mock("fs", () => ({
//   mkdir: jt.jest.fn((path, options, callback: any) => callback(null)),
//   // Mock other fs methods if necessary
// }));

// jt.jest.mock("../src/utils/ConsoleUtil", () => ({
//   error: jt.jest.fn(),
// }));

// jt.jest.mock("../src/utils/fileUtil", () => ({
//   extractZipFile: jt.jest.fn(),
// }));

// jt.jest.mock("node-stream-zip", () => {
//   return jt.jest.fn().mockImplementation(() => {
//     return {
//       on: jt.jest.fn(),
//       extract: jt.jest.fn(),
//       close: jt.jest.fn(),
//     };
//   });
// });

// describe("extractZipFile", () => {
//   it("should handle errors during extraction", async () => {
//     const zip = {
//       on: jt.jest.fn((event, callback: any) => {
//         if (event === "ready") {
//           callback();
//         }
//       }),
//       extract: jt.jest.fn((entry, target, callback: any) => {
//         callback("error");
//       }),
//       close: jt.jest.fn(),
//     };

//     const extractedFolder = "extractedFolder";
//     const TMP_FOLDER = "tmpFolder";

//     try {
//       await extractZipFile(
//         zip as typeof StreamZip,
//         extractedFolder,
//         TMP_FOLDER,
//       );
//       expect(fs.mkdir).toHaveBeenCalledWith(
//         `${TMP_FOLDER}/${extractedFolder}`,
//         { recursive: true },
//       );
//     } catch (e) {
//       expect(fs.mkdir).toHaveBeenCalledWith(
//         `${TMP_FOLDER}/${extractedFolder}`,
//         { recursive: true },
//       );
//       expect(zip.on).toHaveBeenCalledTimes(2);
//       expect(zip.extract).toHaveBeenCalledWith(
//         null,
//         `${TMP_FOLDER}/${extractedFolder}`,
//         expect.any(Function),
//       );
//       expect(zip.close).toHaveBeenCalled();
//       expect(ConsoleUtil.error).toHaveBeenCalledWith("Extract error");
//     }
//   });
// });
