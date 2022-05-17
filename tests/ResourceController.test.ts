import { ResourceController } from '../src/controller/ResourceController';
import * as httpMocks from 'node-mocks-http';
import FormData = require('form-data');
import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';

const dbName = 'test';
const resourceController = new ResourceController();

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${dbName}`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
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
      if (error.message === 'ns not found') return;

      // This error happens when you use it.
      // Safe to ignore.
      if (error.message.includes('a background operation is currently running'))
        return;

      console.log(error.message);
    }
  }
}

afterAll(async (done) => {
  await removeAllCollections();
  done();
}, 6000);

test('should return false upload dummy file which are not .zip', async (done) => {
  const formData = new FormData();
  formData.append(
    'resource',
    fs.createReadStream(path.join(__dirname, 'testFiles', 'test.json')),
  );

  const request = httpMocks.createRequest({
    method: 'POST',
    url: '/api/:username/upload/resource',
    params: {
      username: 'Tester',
    },
    headers: formData.getHeaders(),
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: 'Tester' } };

  const err = null;

  await resourceController.createNewResource(request, resp, err);

  const data = resp._getJSONData();
  expect(data.success).toBeFalsy();

  done();
});

test('should create new resource area', async (done) => {
  const payload = { name: 'hello area', description: 'nothing here' };

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/:username/area/create',
    body: payload,
  });

  const resp = httpMocks.createResponse();
  await resourceController.createNewArea(req, resp);
  const data = resp._getJSONData();

  expect(data.success).toBeTruthy();
  done();
});

test('Should get Resource list from database', async (done) => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/api/:username/resources/1',
    params: {
      username: 'Tester',
    },
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: 'Tester' } };
  await resourceController.getAllResources(request, resp);
  const data = resp._getJSONData();

  expect(data.success).toBeTruthy();
  done();
});
