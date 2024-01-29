import "dotenv/config";
import { MongoClient } from "mongodb";
import { testResourcesLinks } from "./testResourcesLinks";
import { LinkResource } from "./testResourcesLinks";

//Connect MongDB and Run Main function: testResourcesLinks
// Initialize Database Connection
const initializeDatabaseConnection = () => {
  const databaseUrl = "mongodb://localhost:27017";
  const databaseName = process.env.DATABASE_URL?.split("27017/")[1];
  const client = new MongoClient(databaseUrl);
  return { client, databaseName };
};
const runUrlLinkValidator = async () => {
  // Connect to database TODO: implement Anisble Variable: DATABASE_URL to this Script
  const { client, databaseName } = initializeDatabaseConnection();
  await client.connect();
  try {
    if (!client) throw new Error("Database connection error");
    const db = client.db(databaseName);
    const resourceCollection = db.collection("survey_nodes");
    const resources = (
      await resourceCollection
        .find({}, { projection: { _id: 0, manta_link: 1, tiles_id: 1 } })
        .toArray()
    ).map((doc) => ({
      manta_link: doc.manta_link,
      tiles_id: doc.tiles_id,
    })) as LinkResource[];
    await testResourcesLinks(resources);
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
