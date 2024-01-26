import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import SiteHome from "../src/components/SiteHome";

jest.mock("../src/utils/NetworkCalls", () => ({
  getFullSites: jest
    .fn()
    .mockResolvedValue({ payload: [{ _id: "mockedSiteId" }] }),
  getFloorSurveyExistence: jest.fn().mockResolvedValue(true),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    siteId: 1,
  }),
}));

describe("SiteHome Component", () => {
  const originalEnv = global.window._env_;

  beforeAll(() => {
    global.window._env_ = {
      API_URL: "https://example.com",
      PROJECT_TITLE: "Test Project",
      USE_SSO: true,
    };
  });

  afterAll(() => {
    global.window._env_ = originalEnv;
  });

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ key: "value" }),
    }) as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should use API URL from window._env_", async () => {
    render(
      <Router>
        <SiteHome onButtonClick={() => {}} />
      </Router>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Prism/)).toBeInTheDocument();
      const urlCalled = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(urlCalled).toBe("https://example.com/api/site/1/settings");
    });
  });
});
