import { FAQController } from '../src/controller/FAQController';
import * as httpMocks from 'node-mocks-http';
import * as mongoose from 'mongoose';

const dbName = 'test';
const faqController = new FAQController();

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

test('Should create question and answer', async (done) => {
  const payload = [
    {
      question: 'hello?',
      answer: 'yes?',
    },
  ];

  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/api/:username/faq/post',
    params: {
      username: 'Tester',
    },
    body: payload,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: 'Tester' } };

  await faqController.createQuestionAnswer(request, resp);

  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});

test('Should be able to get faq', async (done) => {
  const request = httpMocks.createRequest({
    method: 'POST',
    url: '/api/:username/faq/post',
    params: {
      username: 'Tester',
    },
  });

  const resp = httpMocks.createResponse();

  await faqController.getFAQ(request, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});

test('Should be able to edit faq', async (done) => {
  const payload = {
    question: 'updated question?',
  };

  const request = httpMocks.createRequest({
    method: 'PUT',
    url: '/api/:username/faq/put/:idx',
    params: {
      username: 'Tester',
      idx: 0,
    },
    body: payload,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: 'Tester' } };

  await faqController.editQuestionAnswer(request, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});

test('Should be able to delete faq', async (done) => {
  const payload = {
    idx: 0,
  };

  const request = httpMocks.createRequest({
    method: 'DELETE',
    url: '/api/:username/faq/delete',
    params: {
      username: 'Tester',
    },
    body: payload,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: 'Tester' } };

  await faqController.deleteQuestionAnswer(request, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();

  done();
});
