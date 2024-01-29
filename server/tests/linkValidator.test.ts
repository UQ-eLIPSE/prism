import "dotenv/config";
import { MongoClient, Db } from "mongodb";
import { testResourcesLinks } from "../src/db/util/testResourcesLinks";

// const dbList: string[] = ["camphill"]; // List of databases

// dbList.forEach(() => {
describe("Manta Resource URLlink Validator", () => {
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    client = await MongoClient.connect("mongodb://localhost:27017");
    db = client.db(process.env.DATABASE_URL?.split("27017/")[1]);
  });
  afterAll(async () => {
    await client.close();
  });

  test("Each manta link retrieved from the prism database receives an accurate web response", async () => {
    const resourceCollection = db.collection("survey_nodes");
    const result = await testResourcesLinks(resourceCollection);

    expect(result).toBe(true);
  });
});
// });
