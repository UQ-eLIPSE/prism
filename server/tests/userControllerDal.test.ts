import * as httpMocks from "node-mocks-http";
import { AuthUtil } from "../src/utils/AuthUtil";
import usersHandler from "../src/dal/usersHandler";
import { IUser } from "../src/models/UserModel";
import { mocked } from "jest-mock";

// Jest mock DAL function usersFindOne
jest.mock("../src/dal/usersHandler");
// Mock User Data
const mockUser = {
  username: "Test",
  role: "user",
} as IUser;
//todo: Typescript discourage using assertion, seek a better approach.
// Mock the DAL functions
mocked(usersHandler.findOne).mockResolvedValue(mockUser);
describe("AuthUtil", () => {
  describe("getUserInfo", () => {
    it("should return user information", async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      res.locals = {
        user: { user: "Test" },
      };

      // Call API method
      await AuthUtil.getUserInfo(req, res);

      // Assert
      expect(usersHandler.findOne).toHaveBeenCalledWith({
        username: "Test",
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toStrictEqual({
        success: true,
        message: "",
        payload: mockUser,
      });
    });

    it("should handle the case when the user does not exist", async () => {
      mocked(usersHandler.findOne).mockResolvedValue(null);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      res.locals = {
        user: { user: "NonExistentUser" },
      };

      await AuthUtil.getUserInfo(req, res);

      expect(usersHandler.findOne).toHaveBeenCalledWith({
        username: "NonExistentUser",
      });
      //The res.status is set to be successfully
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toStrictEqual({
        success: true,
        message: "",
        payload: null,
      });
    });
  });
});
