import { Request, Response } from "express";
import { AuthUtil } from "../src/utils/AuthUtil";
import { usersFindOne } from "../src/dal/usersHandler";
import { IUser } from "../src/models/UserModel";
import { mocked } from "jest-mock";

// Jest mock DAL function usersFindOne
jest.mock("../src/dal/usersHandler");
// Mock User Data
const mockUser = {
  username: "testUser",
  role: "user",
} as IUser;
//
// Mock the DAL functions
mocked(usersFindOne).mockResolvedValue(mockUser);
describe("AuthUtil", () => {
  describe("getUserInfo", () => {
    it("should return user information", async () => {
      const req = {} as Request;
      const res = {
        locals: {
          user: { user: "testUser" },
        },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Call API method
      await AuthUtil.getUserInfo(req, res);

      // Assert
      expect(usersFindOne).toHaveBeenCalledWith({ username: "testUser" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "",
        payload: mockUser,
      });
    });
  });
});
