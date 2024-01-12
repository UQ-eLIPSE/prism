import * as fs from "fs/promises";
import { MongoClient, Collection } from "mongodb";
import * as path from "path";
import { validateURLResponse } from "./utils";

interface Resource {
  manta_link: string;
  tiles_id: string;
}

const parentDir = path.dirname(__dirname);
const linksTestingLogs = `${parentDir}/urlData/links-testing-logs`;

// Test main Function
const testResourcesLinks = async (resourceCollection: Collection) => {
  const resourcesLinksLogs = `${linksTestingLogs}/resources_links_logs.csv`;
  const headers = "brokenLink,errorMessage,errorCode\n";

  await writeCsvHeaders(resourcesLinksLogs, headers);

  const resources = (
    await resourceCollection
      .find({}, { projection: { _id: 0, manta_link: 1, tiles_id: 1 } })
      .toArray()
  ).map((doc) => ({
    manta_link: doc.manta_link,
    tiles_id: doc.tiles_id,
  })) as Resource[];

  const resourceLinkVerification = resources.map((resource) =>
    validateResourceLink(resource, resourcesLinksLogs),
  );

  await Promise.all(resourceLinkVerification);
  console.info("\u2713 Broken links step: Resources");
};

// Utility function to write headers to CSV
async function writeCsvHeaders(
  filePath: string,
  headers: string,
): Promise<void> {
  await fs.writeFile(filePath, headers);
}

// Validate a single resource link
async function validateResourceLink(
  resource: Resource,
  logPath: string,
): Promise<void> {
  const concatenatedLink = `${resource.manta_link}${resource.tiles_id}`;
  await validateURLResponse(logPath, concatenatedLink);
}

//Run Main function
const runUrlLinkValidator = async () => {
  // Connect to database TODO: implement Anisble Variable: DATABASE_URL to this Script
  const databaseUrl = "mongodb://localhost:27017/urban_water";
  const databaseName = "urban_water";
  const client = new MongoClient(databaseUrl);
  await client.connect();
  try {
    if (!client) throw new Error("Database connection error");

    // Prism database, TODO: implement anisble to pass the variable: DATABASE_NAME
    const db = client.db(databaseName);
    // Reference to the resources collection
    const resourceCollection = db.collection("survey_nodes");
    await testResourcesLinks(resourceCollection);
    await client.close();
    console.log("Script completed. Exiting.");
    process.exit(0);
  } catch (error) {
    await client.close();
    console.error(error.message);
    process.exit(1);
  }
};

runUrlLinkValidator();
