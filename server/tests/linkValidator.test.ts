import { parse } from "csv-parse";
import * as fs from "fs";
import * as path from "path";

import "dotenv/config";

import { LinkResource } from "../src/db/util/testResourcesLinks";
import { testResourcesLinks } from "../src/db/util/testResourcesLinks";

import { LinkFile, testFilesLinks } from "../src/db/util/testFilesLinks";

const parentDir = path.dirname(__dirname);
const resourcesLinksLogs: string = `${parentDir}/src/db/logs/broken-links-logs.csv`;

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
  const workingLinkResource: LinkResource[] = [
    {
      manta_link:
        "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo-002/site/",
      tiles_id: "0_walkway",
    },
  ];

  const brokenLinkResource: LinkResource[] = [
    {
      manta_link:
        "https://stluc.manta.uqcloud.net/elipse/public/PRISM/agco360/boomaroo-002/site/",
      tiles_id: "0walkway",
    },
  ];

  test("Links receives an accurate web response", async () => {
    const result = await testResourcesLinks(workingLinkResource);

    expect(result).toBe(true);
  });

  test("Links receives an error web response", async () => {
    const result = await testResourcesLinks(brokenLinkResource);
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

describe("Manta Resource File documentation link validator", () => {
  const workingLinkUrl: string =
    "https://stluc.manta.uqcloud.net/elipse/public/PRISM/andrew_liveris/drawings/ANLB For Construction - Main Works Tender/T0500 Drawings/T0500.7 Mechanical/60515147-ME-DWG-257-1 [T1].pdf";
  const brokenLinkUrl: string =
    workingLinkUrl + Math.floor(Math.random() * 10) + 1;

  const workingLinkFile: LinkFile[] = [
    {
      name: "60515147-ME-DWG-257-1 [T1].pdf",
      url: workingLinkUrl,
      // * What will be displayed in the url.
      // url: "https://stluc.manta.uqcloud.net/elipse/public/PRISM/andrew_liveris/drawings/ANLB%20For%20Construction%20-%20Main%20Works%20Tender/T0500%20Drawings/T0500.7%20Mechanical/60515147-ME-DWG-257-1%20[T1].pdf",
    },
  ];

  const brokenLinkFile: LinkFile[] = [
    {
      name: "60515147-ME-DWG-257-1 [T1].pdf",
      url: brokenLinkUrl,
    },
  ];

  test("Links receives an accurate web response", async () => {
    console.log("first one", workingLinkFile[0].url.split(" ").join("%20"));
    const result = await testFilesLinks(workingLinkFile);
    expect(result).toBe(true);
  });

  test("Links receives an error web response", async () => {
    const result = await testFilesLinks(brokenLinkFile);
    expect(result).toBe(false);

    const fileExists = fs.existsSync(resourcesLinksLogs);
    expect(fileExists).toBeTruthy();

    const brokenLinks = await readBrokenLinksFromCSV(resourcesLinksLogs);
    const csvResult = brokenLinks[0] === brokenLinkUrl;
    expect(csvResult).toBeTruthy();
  });
});
