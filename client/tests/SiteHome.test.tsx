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
