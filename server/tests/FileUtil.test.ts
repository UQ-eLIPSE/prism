import * as jt from "@jest/globals";
import { extractZipFile } from "../src/utils/fileUtil";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../src/utils/ConsoleUtil";

const { describe, it, expect } = jt;

const EXTRACTED_MSGS = {
  success: "Extracted",
  error: "Error",
};

// types
type MkDirType = typeof fs.mkdir;
type StreamZipType = typeof StreamZip;

// MOCKS
jt.jest.mock("fs", () => ({
  mkdir: jt.jest.fn((_, __, callback: MkDirType) => callback("")),
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
      file: `${TMP_FOLDER}/${extractedFolder}.zip`,
      storeEntries: true,
    });

    mockZip.on = jt.jest.fn((event, callback: StreamZipType) => {
      if (event === "ready") callback();
    });

    mockZip.extract = jt.jest.fn((entry, target, callback: StreamZipType) => {
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

    expect(ConsoleUtil.success).toHaveBeenCalledWith(EXTRACTED_MSGS.success);

    const files = await fs.readdir(`${TMP_FOLDER}`);
    expect(files).toContain(extractedFolder);
  });

  it("should not extract zip file successfully", async () => {
    mockZip.extract = jt.jest.fn((_, __, callback: StreamZipType) => {
      callback("Error");
    });

    mockZip.on = jt.jest.fn((event, callback: StreamZipType) => {
      if (event === "ready") callback();
    });

    const result = await extractZipFile(mockZip, extractedFolder, TMP_FOLDER);

    expect(result).toBe(false);
    expect(ConsoleUtil.error).toHaveBeenCalledWith(EXTRACTED_MSGS.error);
  });

  jt.afterEach(async () => {
    const directoryExists = await fs
      .access(`${TMP_FOLDER}/${extractedFolder}`)
      .then(() => true)
      .catch(() => false);

    if (directoryExists) {
      await fs.rm(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });
    }
  });
});