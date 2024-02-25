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
  expect(data.payload.firstName).toEqual(expectedResult.firstName);
  expect(data.payload.lastName).toEqual(expectedResult.lastName);
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
  expect(data.payload.users[0].firstName).toEqual(
    expectedResult.users[0].firstName,
  );
  expect(data.payload.users[0].lastName).toEqual(
    expectedResult.users[0].lastName,
  );
  expect(data.payload.users[0].role).toEqual(expectedResult.users[0].role);
});

test("Should be able to invite user", async () => {
  process.env.JWT_Hash = "supersecret";

  const newInvitedUser = {
    email: `testing1@test.com`,
    firstName: "User2",
    lastName: "Tester",
    role: "projectAdmin",
  };
  const req = httpMocks.createRequest({
    method: "POST",
    url: "/api/user/:username/invite",
    params: {
      username: "Tester",
    },
    app: {
      get: jest.fn(() => {
        return { sendMail: jest.fn() };
      }),
    },
    body: newInvitedUser,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await userController.inviteUser(req, resp);

  const data = resp._getJSONData();
  const successMessage = `An invite email has been sent to ${newInvitedUser.email}`;
  expect(data.message).toEqual(successMessage);
});

test("Should return false when updating invited user without id", async () => {
  const invitedUserTobeUpdated = { firstName: "Userupdated2" };

  const req = httpMocks.createRequest({
    method: "GET",
    url: `/api/users/:username/:usernameToBeUpdated`,
    params: {
      username: "Tester",
    },
    body: invitedUserTobeUpdated,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await userController.updateInvitedUser(req, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeFalsy();
});

test("Should delete invited user", async () => {
  const invitedUserTobeDeleted = { email: `testing1@test.com` };

  const req = httpMocks.createRequest({
    method: "GET",
    url: `/api/users/:username/:usernameToBeUpdated`,
    params: {
      username: "Tester",
    },
    body: invitedUserTobeDeleted,
  });

  const resp = httpMocks.createResponse();
  resp.locals = { user: { username: "Tester" } };

  await userController.deleteInvitedUser(req, resp);
  const data = resp._getJSONData();
  expect(data.success).toBeTruthy();
});

test("Should be able to send forgot password email", async () => {
  process.env.JWT_Hash = "supersecret";

  const userEmail = { email: `testing0@test.com` };
  const req = httpMocks.createRequest({
    method: "POST",
    url: "/api/forgot-password",
    app: {
      get: jest.fn(() => {
        return { sendMail: jest.fn() };
      }),
    },
    body: userEmail,
  });

  const resp = httpMocks.createResponse();
  await userController.sendEmailForgotPassword(req, resp);

  const data = resp._getJSONData();
  const successMessage = `We will send the email to reset your password if your email is found`;
  expect(data.message).toEqual(successMessage);
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
