/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jt from "@jest/globals";
import { extractZipFile } from "../src/utils/fileUtil";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../src/utils/ConsoleUtil";

const { describe, it, expect } = jt;

jt.jest.mock("fs", () => ({
  mkdir: jt.jest.fn((path, options, callback: any) => callback(null)),
  // Mock other fs methods if necessary
  open: jt.jest.fn(),
}));
ConsoleUtil.error = jt.jest.fn();
ConsoleUtil.success = jt.jest.fn();

describe("Test case: Should extract zip files", () => {
  const TMP_FOLDER = "tests/testFiles";
  const extractedFolder = "prism_new_field";
  let mockZip: typeof StreamZip;

  jt.beforeEach(() => {
    jt.jest.clearAllMocks();
    mockZip = new StreamZip({
      file: "./tests/testFiles/prism_new_field.zip",
      storeEntries: true,
    });

    mockZip.on = jt.jest.fn((event, callback: any) => {
      if (event === "ready") {
        callback();
      }
    });

    mockZip.extract = jt.jest.fn((entry, target, callback: any) => {
      callback(null);
    });

    mockZip.close = jt.jest.fn();
  });

  it("should extract zip file successfully", async () => {
    const result = await extractZipFile(mockZip, extractedFolder, TMP_FOLDER);

    expect(result).toBe(true);

    // Check if the extract method was called with the correct target directory
    expect(mockZip.extract).toHaveBeenCalledWith(
      null,
      `${TMP_FOLDER}/${extractedFolder}`,
      expect.any(Function),
    );

    expect(ConsoleUtil.success).toHaveBeenCalledWith("Extracted");

    const files = await fs.readdir(`${TMP_FOLDER}`);
    expect(files).toContain(extractedFolder);
  });

  it("should not extract zip file successfully", async () => {
    mockZip.extract = jt.jest.fn((entry, target, callback: any) => {
      callback("Error");
    });

    const result = await extractZipFile(mockZip, extractedFolder, TMP_FOLDER);

    expect(result).toBe(false);
    expect(ConsoleUtil.error).toHaveBeenCalledWith("Error");
  });

  jt.afterEach(async () => {
    const directoryExists = await fs
      .access(`${TMP_FOLDER}/${extractedFolder}`)
      .then(() => true)
      .catch(() => false);

    if (directoryExists) {
      await fs.rmdir(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });
    }
  });
});
