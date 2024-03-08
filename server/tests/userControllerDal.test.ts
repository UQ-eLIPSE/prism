import { Request } from "express";
import { AuthUtil } from "../src/utils/AuthUtil";
import usersHandler from "../src/dal/usersHandler";
import { IUser } from "../src/models/UserModel";
import { mocked } from "jest-mock";
import { mockResponse } from "./testUtils";

// Jest mock DAL function usersFindOne
jest.mock("../src/dal/usersHandler");
// Mock User Data
const mockUser = {
  username: "testUser",
  role: "user",
} as IUser;
//todo: Typescript discourage using assertion, seek a better approach.
// Mock the DAL functions
mocked(usersHandler.findOne).mockResolvedValue(mockUser);
describe("AuthUtil", () => {
  describe("getUserInfo", () => {
    it("should return user information", async () => {
      const req = {} as Request;
      const res = mockResponse();
      res.locals = {
        user: { user: "testUser" },
      };

      // Call API method
      await AuthUtil.getUserInfo(req, res);

      // Assert
      expect(usersHandler.findOne).toHaveBeenCalledWith({
        username: "testUser",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "",
        payload: mockUser,
      });
    });
  });
});
