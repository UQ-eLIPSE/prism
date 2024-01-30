import React from "react";
import { render, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "../src/components/Sidebar";

jest.mock("../src/utils/NetworkCalls", () => ({
  getFloorSurveyExistence: jest.fn().mockResolvedValue(true),
}));

describe("Sidebar Component", () => {
  it("renders correctly based on user role and environment settings", async () => {
    global.window._env_ = {
      API_URL: "https://example.com",
      PROJECT_TITLE: "Test Project",
      USE_SSO: false,
    };
    const mockProps = {
      floor: "0",
      siteId: "dummySiteId",
      onClick: jest.fn(),
    };
    const { container } = render(
      <Router>
        <Sidebar {...mockProps} />
      </Router>,
    );
    await waitFor(() => {
      const links = container.querySelectorAll("nav > a");
      expect(links.length).toBe(3);
    });
  });
});
