import { SurveyController } from "../src/controller/SurveyController";
import * as httpMocks from "node-mocks-http";
import FormData = require("form-data");
import * as fs from "fs";
import * as path from "path";
import * as mongoose from "mongoose";

const dbName = "test";
const surveyController = new SurveyController();

const OLD_ENV = process.env;

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${dbName}`;
  await mongoose.connect(url);
  jest.resetModules();
  process.env = { TMP_FOLDER: "~", ...OLD_ENV };
  delete process.env.NODE_ENV;
});

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped.
      // Happens infrequently.
      // Safe to ignore.
      if (error.message === "ns not found") return;

      // This error happens when you use it.
      // Safe to ignore.
      if (error.message.includes("a background operation is currently running"))
        return;
    }
  }
}

afterAll(async () => {
  await removeAllCollections();
  process.env = OLD_ENV;
  await mongoose.connection.close();
}, 6000);

test("should return false upload dummy file which are not .zip", async () => {
  const formData = new FormData();
  formData.append(
    "surveys",
    fs.createReadStream(path.join(__dirname, "testFiles", "test.json")),
  );

  const request = httpMocks.createRequest({
    method: "POST",
    url: "/api/:username/upload/survey",
    params: {
      username: "Tester",
    },
    headers: formData.getHeaders(),
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await surveyController.uploadSurvey(request, resp);

  const data = resp._getJSONData();
  expect(data.success).toBeFalsy();
});

test("Should get Survey list from database", async () => {
  const request = httpMocks.createRequest({
    method: "GET",
    url: "/api/:username/surveys",
    params: {
      username: "Tester",
    },
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await surveyController.getAllSurveys(request, resp);
  const data = resp._getJSONData();

  expect(data.success).toBeTruthy();
});
