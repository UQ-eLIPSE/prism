import mongoose from "mongoose";
import * as jt from "@jest/globals";
import { ResourceController } from "../src/controller/ResourceController";
import * as fs from "fs";
import * as path from "path";
import FormData = require("form-data");
import * as httpMocks from "node-mocks-http";

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

jt.it("1 is 1", () => {
  jt.expect(1).toBe(1);
});
jt.describe("Uploading documentation", () => {});
jt.it("should return false upload dummy file which are not .zip", async () => {
  const formData = new FormData();
  formData.append(
    "resource",
    fs.createReadStream(path.join(__dirname, "testFiles", "test.json")),
  );

  const request = httpMocks.createRequest({
    method: "POST",
    url: "/api/:username/upload/resource",
    params: {
      username: "Tester",
    },
    headers: formData.getHeaders(),
  });

  const err = { code: "err" };
  const response = httpMocks.createResponse();
  await resourceController.createNewResource(request, response, err);

  const data = response._getJSONData();
  jt.expect(data.success).toBe(false);
});

jt.afterAll(async () => {
  await removeAllCollections();
  await mongoose.connection.close();
}, 6000);
