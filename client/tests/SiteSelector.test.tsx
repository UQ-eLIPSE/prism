import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { IntlProvider } from "react-intl";
import SiteSelector from "../src/components/SiteSelector";

jest.mock("../src/utils/NetworkCalls", () => ({
  getSiteMap: jest.fn().mockResolvedValue({
    payload: {
      name: "Test Site",
      image_url: "https://example.com/site-map.jpg",
    },
  }),
}));

// A helper function to wrap the component with IntlProvider
const renderWithIntl = (
  component: React.ReactElement,
  {
    locale = "en",
    messages = { seeMoreFarms: "See More Farms" },
  }: { locale?: string; messages?: Record<string, string> } = {},
) => {
  return render(
    <IntlProvider locale={locale} messages={messages}>
      {component}
    </IntlProvider>,
  );
};

describe("SiteSelector Component", () => {
  it("renders the project title from environment variables", async () => {
    renderWithIntl(
      <Router>
        <SiteSelector onButtonClick={() => {}} />
      </Router>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Test Project",
      );
    });
  });
});
