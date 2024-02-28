import * as mongoose from "mongoose";
import { User } from "../src/models/UserModel";
import { UserController } from "../src/controller/UserController";
import * as httpMocks from "node-mocks-http";

const dbName = "test";
const userController = new UserController();

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${dbName}`;
  await mongoose.connect(url);
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
  await mongoose.connection.close();
}, 6000);

test("Should save user to database", async () => {
  const users = [
    {
      email: `testing0@test.com`,
      firstName: "Ratata",
      lastName: "Tester",
      role: "projectAdmin",
      username: "Tester",
    },
    {
      email: `testing1@uq.edu.au`,
      firstName: "Ratata",
      lastName: "Tester2",
      role: "projectAdmin",
      username: "uqTester2",
    },
    {
      email: `testing2@test.com`,
      firstName: "Ratata",
      lastName: "Tester3",
      role: "projectAdmin",
      username: "Tester3",
    },
  ];

  for (const user of users) {
    const newUser = await new User(user);
    await newUser.save();
  }
});

test("get user using api", async () => {
  const expectedResult = {
    email: `testing0@test.com`,
    firstName: "Ratata",
    lastName: "Tester",
    role: "projectAdmin",
    username: "Tester",
  };
  const request = httpMocks.createRequest({
    method: "GET",
    url: "/api/user",
    params: {
      username: "Tester",
    },
  });

  const resp = httpMocks.createResponse();
  await userController.getCurrentUserDetails(request, resp);
  const data = resp._getJSONData();

  expect(data.success).toBeTruthy();
  expect(data.payload.email).toEqual(expectedResult.email);
  expect(data.payload.role).toEqual(expectedResult.role);
});

test("Should get User list from database", async () => {
  const expectedResult = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    nextPage: 1,
    users: [
      {
        firstName: "Ratata",
        lastName: "Tester",
        email: "testing0@test.com",
        role: "projectAdmin",
        username: "Tester",
        __v: 0,
      },
    ],
  };

  const request = httpMocks.createRequest({
    method: "GET",
    url: "/api/users",
    params: {
      username: "Tester",
    },
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };
  await userController.getUserList(request, resp);
  const data = resp._getJSONData();

  expect(data.success).toBeTruthy();
  expect(data.payload.users[0].email).toEqual(expectedResult.users[0].email);
  expect(data.payload.users[0].role).toEqual(expectedResult.users[0].role);
});

test("Should update user password", async () => {
  const bodyPayload = { email: `testing0@test.com`, password: `password123` };

  const req = httpMocks.createRequest({
    method: "POST",
    url: "/api/update-password",
    body: bodyPayload,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };
  await userController.updateUserPassword(req, resp);

  const data = resp._getJSONData();
  const successMessage = "Password is updated successfully";

  expect(data.message).toEqual(successMessage);
});

test("Should return search result", async () => {
  const req = httpMocks.createRequest({
    method: "GET",
    url: `/api/users/:username/search`,
    params: {
      username: "Tester",
    },
    query: {
      query: "User2",
    },
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };
  await userController.searchUser(req, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();
});

test("Should change UQ user role to guest", async () => {
  const req = httpMocks.createRequest({
    method: "GET",
    url: `/api/users/:username/:usernameToBeUpdated`,
    params: {
      username: "Tester",
      usernameToBeUpdated: "uqTester2",
    },
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await userController.updateUserRole(req, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();
});
