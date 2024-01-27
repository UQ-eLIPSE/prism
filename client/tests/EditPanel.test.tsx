import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import EditPanel from "../src/components/EditPanel";
import { PinData } from "../src/components/SiteSelector";
import "@testing-library/jest-dom";

jest.mock("react-intl", () => ({
  ...jest.requireActual("react-intl"),
  FormattedMessage: ({ id }: { id: string }) => <span>{id}</span>,
  useIntl: () => ({ formatMessage: jest.fn() }),
}));

// Mock data for PinData
const mockSelectedSite: PinData = {
  _id: "mockedSiteId",
  site: "exampleSite",
  name: "Example Site",
  x: 0,
  y: 0,
  icon: "exampleIcon",
  cover_image: "exampleCoverImageUrl",
  enabled: true,
  sitemap: "exampleSitemap",
};

describe("EditPanel Component", () => {
  it("should use API URL from window._env_ when checking scene existence", async () => {
    const { getByTestId } = render(
      <Router>
        <EditPanel
          selectedSite={mockSelectedSite}
          toggleMove={() => {}}
          toggleAdd={() => {}}
          deletePin={() => {}}
          hidePin={() => {}}
          setEditState={() => {}}
          editState="test"
          save={true}
          setSave={() => {}}
          setUpdatePinStates={() => {}}
          setAddPinInfo={() => {}}
          updateSiteCoords={() => {}}
          addPinInfo={false}
          setSitemapModal={() => {}}
          onClick={() => {}}
        />
      </Router>,
    );
    const redirectButton = getByTestId("redirectButton");
    fireEvent.click(redirectButton);
    await waitFor(() => {
      const urlCalled = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(urlCalled).toBe("https://example.com/api/site/exampleSite/exists");
    });
  });
});
