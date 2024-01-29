import React from "react";
import { render, waitFor } from "@testing-library/react";
import SceneTitle from "../src/components/SceneTitle";

describe("SceneTitle Component", () => {
  it("should fetch site data using API URL from window._env_", async () => {
    render(<SceneTitle siteId="exampleSiteId" mode="addNewSite" />);
    await waitFor(() => {
      const urlCalled = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(urlCalled).toBe("https://example.com/api/map-pins");
    });
  });
});
