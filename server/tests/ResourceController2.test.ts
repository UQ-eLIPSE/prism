import { ResourceController } from "../src/controller/ResourceController";
import mongoose from "mongoose";
import * as jt from "@jest/globals";

const dbName = "test";
const resourceController = new ResourceController();

jt.beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${dbName}`;
  await mongoose.connect(url);
});

const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  collections.forEach(async (collectionname) => {
    const collection = mongoose.connection.collections[collectionname];
    try {
      await collection.drop();
    } catch (error) {
      if (error.message === "ns not found") return;
      if (error.message.includes("a background operation is currently running"))
        return;
    }
  });
};

jt.afterAll(async () => {
  await removeAllCollections();
  await mongoose.connection.close();
}, 6000);

jt.describe("ResourceController", () => {
  jt.it("1 is 1", () => {
    jt.expect(1).toBe(1);
  });
});
