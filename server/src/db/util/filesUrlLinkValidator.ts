import "dotenv/config";
import { MongoClient } from "mongodb";
import { ConsoleUtil } from "../../utils/ConsoleUtil";
import { LinkFile, testFilesLinks } from "./testFilesLinks";

//Connect MongDB and Run Main function: testFilesLinks
// Initialize Database Connection
const initialiseDatabaseConnection = () => {
  const databaseUrl = "mongodb://localhost:27017";
  const databaseName = process.env.DATABASE_URL?.split("27017/")[1];
  const client = new MongoClient(databaseUrl);
  return { client, databaseName };
};

const runFilesUrlLinkValidator = async () => {
  const { client, databaseName } = initialiseDatabaseConnection();
  await client.connect();
  try {
    if (!client) throw new Error("Database connection error");
    const db = client.db(databaseName);
    const fileCollection = db.collection("files");
    const documentCount = await fileCollection.countDocuments();
    ConsoleUtil.log(
      `Checking validity of links in the "files" collection: ${documentCount}`,
    );

    const files = (
      await fileCollection
        .find({}, { projection: { _id: 0, name: 1, url: 1 } })
        .toArray()
    ).map((doc) => ({
      name: doc.name,
      url: doc.url,
    })) as LinkFile[];

    await testFilesLinks(files);
    await client.close();
    ConsoleUtil.log("Script completed. Exiting.");
    process.exit(0);
  } catch (error) {
    await client.close();
    ConsoleUtil.error(error.message);
    process.exit(1);
  }
};

runFilesUrlLinkValidator();
