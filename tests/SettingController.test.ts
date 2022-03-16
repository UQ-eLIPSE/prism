import {SettingController} from "../src/controller/SettingController";
import * as httpMocks from 'node-mocks-http';
import * as mongoose from "mongoose";

const dbName = "test";
const settingController = new SettingController();

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${dbName}`;
  await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
});

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
      // Safe to ignore.
      if (error.message === 'ns not found') return;

      // This error happens when you use it.
      // Safe to ignore.
      if (error.message.includes('a background operation is currently running')) return;

      console.log(error.message)
    }
  }
}

afterAll(async (done) => {
  await removeAllCollections();
  done();
}, 6000);

test('Should get the settings table', async (done)=> {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/api/:username/visibility/settings',
    params: {
      username: 'Tester'
    }
  });

  const resp = httpMocks.createResponse();
  resp.locals = {user: {username: 'Tester'}};

  await settingController.getSettings(request, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});


test('Should toggle object in the settings table', async (done)=> {
  const request = httpMocks.createRequest({
    method: 'PUT',
    url: '/api/:username/visibility/settings',
    params: {
      username: 'Tester'
    },
    body: {
      "mediaPageVisibility": true
    }
  });

  const resp = httpMocks.createResponse();
  resp.locals = {user: {username: 'Tester'}};

  await settingController.togglePagesVisibility(request, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});
