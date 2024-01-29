import "dotenv/config";
import { MongoClient } from "mongodb";
import { testResourcesLinks } from "./testResourcesLinks";

//Connect MongDB and Run Main function: testResourcesLinks
// Initialize Database Connection
const initializeDatabaseConnection = () => {
  const databaseUrl = "mongodb://localhost:27017";
  const databaseName =
    process.env.DATABASE_URL?.split("27017/")[1] || "camphill";
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
