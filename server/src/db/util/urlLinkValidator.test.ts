import * as fs from "fs/promises";
import { MongoClient, Collection } from "mongodb";
import * as path from "path";
// import { loadConfiguration, Configuration, TEMPLATE } from "../../Conf";

const parentDir = path.dirname(__dirname);
const linksTestingLogs = `${parentDir}/urlData/links-testing-logs`;

// let configuration: Configuration = TEMPLATE;
// try {
//   // Check the the environment variable and its validity
// //   configuration = loadConfiguration();
//   //   ConsoleUtil.log(`Configuration loaded`);
// } catch (e) {
//   //   ConsoleUtil.error(e);
//   process.exit(1);
// }

const testResourcesLinks = async (resourceCollection: Collection) => {
  // The file in which we want to keep the broken links
  // TODO: This Logs will send as an email to ELIPSE DEV Team
  const resourcesLinksLogs = `${linksTestingLogs}/resources_links_logs.csv`;

  // All resources in the database (resourceId and links only)
  const resources = await resourceCollection
    .find(
      {},
      {
        projection: {
          _id: 0,
          manta_link: 1,
          tiles_id: 1,
        },
      },
    )
    .toArray();

  interface RelevantObj {
    brokenLink: string;
  }

  // The csv headers matching the reloevant obj interface
  const fields = ["brokenLink"];

  // Create the file with the headers adding "errorMessage" and "errorCode" column
  await fs.writeFile(
    resourcesLinksLogs,
    `${fields.toString()},errorMessage,errorCode\n`,
  );

  // Asynchronously verify url responses for resource suites
  const resourceLinkVerification = resources.map(async (resource) => {
    const concatenatedLink = `${resource.manta_link}${resource.tiles_id}`; // Concatenating manta_link and tiles_id
    const relevantObj: RelevantObj = {
      brokenLink: concatenatedLink,
    };
    await validateURLResponse(resourcesLinksLogs, relevantObj.brokenLink);
  });
  await Promise.all(resourceLinkVerification);
  process.stdout.write("\r \r");
  console.info("\u2713 Broken links step: Resources");
};

const validateURLResponse = async (errorLog: string, input: string) => {
  try {
    const timeOutMillis = 120 * 1000;
    // Test URL by fetching only the Headers
    const race = await Promise.race([
      fetch(input, { method: "HEAD" }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out.")),
          timeOutMillis,
        ),
      ),
    ]);
    const response = <Response>race;
    const status = response.status;
    const unacceptableErrors = [404];

    if (unacceptableErrors.includes(status)) {
      process.stdout.write("\r \r");
      console.error("Invalid url - Unexpected response: ", input);
      await fs.appendFile(
        errorLog,
        `Invalid url - Unexpected status code: "${input}",Status code:${status}\n`,
      );
      return false;
    }
    console.log("url passed");
    return true;
  } catch (error) {
    const unacceptableErrors = ["ENOTFOUND", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"];
    if (
      unacceptableErrors.includes(error.code) ||
      error.message.includes("timed out")
    ) {
      process.stdout.write("\r \r");
      console.error("Invalid url - Unexpected response: ", input);
      await fs.appendFile(
        errorLog,
        `"${error.message}",${error.code ? error.code : ""}\n`,
      );
      return false;
    }
    return true;
  }
};

const exec = async () => {
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
  } catch (error) {
    await client.close();
    console.error(error.message);
    process.exit(1);
  }
};

// Define an async function to wrap the exec() call
async function runScript() {
  try {
    // Call exec with endpointCall set to false
    await exec();
    console.log("Exec function completed successfully.");
  } catch (error) {
    // Handle any errors that occur during the exec function call
    console.error("An error occurred in exec function:", error.message);
  }
}

// Call the new async function
runScript();
