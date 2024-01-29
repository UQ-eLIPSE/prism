import { parse } from "csv-parse";
import * as fs from "fs";
import * as path from "path";

import "dotenv/config";

import { LinkResource } from "../src/db/util/testResourcesLinks";
import { testResourcesLinks } from "../src/db/util/testResourcesLinks";

const parentDir = path.dirname(__dirname);
const resourcesLinksLogs: string = `${parentDir}/src/db/broken-links-logs.csv`;

async function readBrokenLinksFromCSV(filePath: string) {
  return new Promise<string[]>((resolve, reject) => {
    const brokenLinks: string[] = [];
    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        }),
      )
      .on("data", (row) => {
        if (typeof row.brokenLink === "string") {
          brokenLinks.push(row.brokenLink);
        }
      })
      .on("end", () => {
        resolve(brokenLinks);
      })
      .on("error", reject);
  });
}

describe("Manta Resource URLlink Validator", () => {
  const resourceCollection: LinkResource[] = [
    {
      manta_link:
        "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo-002/site/",
      tiles_id: "0_walkway",
    },
  ];

  const resourceCollection_error: LinkResource[] = [
    {
      manta_link:
        "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo-002/site/",
      tiles_id: "0walkway",
    },
  ];

  test("Links receives an accurate web response", async () => {
    const result = await testResourcesLinks(resourceCollection);

    expect(result).toBe(true);
  });

  test("Links receives an error web response", async () => {
    const result = await testResourcesLinks(resourceCollection_error);
    expect(result).toBe(false);

    const fileExists = fs.existsSync(resourcesLinksLogs);
    expect(fileExists).toBeTruthy();

    const brokenLinks = await readBrokenLinksFromCSV(resourcesLinksLogs);
    const csvResult =
      brokenLinks[0] ===
      "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo-002/site/0walkway";
    expect(csvResult).toBeTruthy();
  });
});
