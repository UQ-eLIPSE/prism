import { MongoClient, Collection } from "mongodb";
import { validateURLResponse } from "./utils";

interface LinkResource {
  manta_link: string;
  tiles_id: string;
}

/**
 * Tests the links contained within a collection of resources, which retrieves from the given MongoDB collection,
 * constructs a URL from its `manta_link` and `tiles_id` fields,
 * validates this URL using the `validateURLResponse` function.
 * @param {Collection} resourceCollection - The MongoDB collection containing
 *   the resource documents to be tested. Each document should have `manta_link`
 *   and `tiles_id` fields.
 */
const testResourcesLinks = async (resourceCollection: Collection) => {
  const resources = (
    await resourceCollection
      .find({}, { projection: { _id: 0, manta_link: 1, tiles_id: 1 } })
      .toArray()
  ).map((doc) => ({
    manta_link: doc.manta_link,
    tiles_id: doc.tiles_id,
  })) as LinkResource[];

  const resourceLinkVerification = resources.map(async (resource) => {
    const concatenatedLink = `${resource.manta_link}${resource.tiles_id}`;
    await validateURLResponse(concatenatedLink);
  });

  await Promise.all(resourceLinkVerification);
};

//Connect MongDB and Run Main function: testResourcesLinks
// Initialize Database Connection
const initializeDatabaseConnection = () => {
  const databaseUrl = "mongodb://localhost:27017";
  const databaseName = "urban_water";
  const client = new MongoClient(databaseUrl);
  return { client, databaseName };
};
const runUrlLinkValidator = async () => {
  // Connect to database TODO: implement Anisble Variable: DATABASE_URL to this Script
  const { client, databaseName } = initializeDatabaseConnection();
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
