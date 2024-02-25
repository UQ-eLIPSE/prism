import { extractZipFile } from "../src/utils/fileUtil";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");
import * as fs from "fs/promises";
import { ConsoleUtil } from "../src/utils/ConsoleUtil";

const EXTRACTED_MSGS = {
  success: "Extracted",
  error: "Error",
};

// types
type MkDirType = typeof fs.mkdir;
type StreamZipType = typeof StreamZip;

// MOCKS
jest.mock("fs", () => ({
  mkdir: jest.fn((_, __, callback: MkDirType) => callback("")),
  open: jest.fn(),
}));
ConsoleUtil.error = jest.fn();
ConsoleUtil.success = jest.fn();

describe("Test case: Should extract zip files", () => {
  const TMP_FOLDER = "tests/testFiles";
  const extractedFolder = "prism_new_field";
  let mockZip: typeof StreamZip;

  beforeEach(() => {
    jest.clearAllMocks();
    mockZip = new StreamZip({
      file: `${TMP_FOLDER}/${extractedFolder}.zip`,
      storeEntries: true,
    });

    mockZip.on = jest.fn((event, callback: StreamZipType) => {
      if (event === "ready") callback();
    });

    mockZip.extract = jest.fn((entry, target, callback: StreamZipType) => {
      callback(null);
    });

    mockZip.close = jest.fn();
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
    mockZip.extract = jest.fn((_, __, callback: StreamZipType) => {
      callback("Error");
    });

    mockZip.on = jest.fn((event, callback: StreamZipType) => {
      if (event === "ready") callback();
    });

    const result = await extractZipFile(mockZip, extractedFolder, TMP_FOLDER);

    expect(result).toBe(false);
    expect(ConsoleUtil.error).toHaveBeenCalledWith(EXTRACTED_MSGS.error);
  });

  afterEach(async () => {
    const directoryExists = await fs
      .access(`${TMP_FOLDER}/${extractedFolder}`)
      .then(() => true)
      .catch(() => false);

    if (directoryExists) {
      await fs.rm(`${TMP_FOLDER}/${extractedFolder}`, { recursive: true });
    }
  });
});
