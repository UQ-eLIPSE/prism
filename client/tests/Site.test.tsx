// Site.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import "@testing-library/react/dont-cleanup-after-each";
import Site from "../src/components/Site";
import { BrowserRouter as Router } from "react-router-dom";
import { mockSiteProps } from "./utils/sampleData/siteSampleData";

jest.mock("../src/utils/NetworkCalls", () => ({
  getEmptyFloors: jest.fn().mockResolvedValue({
    success: true,
    emptyFloors: [],
  }),
  getFloors: jest.fn().mockResolvedValue({
    success: true,
    message: "",
    payload: [
      { survey_name: "Survey 78", floor: 2, date: "2021-07-06T14:00:00.000Z" },
      { survey_name: "Survey 78", floor: 3, date: "2021-07-06T14:00:00.000Z" },
    ],
  }),
  fetchFloors: jest.fn().mockResolvedValue([
    {
      _id: "6098a4a384c4673d88dc8279",
      floor: 1,
      site: "5e44e4bfe8b8974459eafba1",
    },
    {
      _id: "6098a4a384c4673d88dc827b",
      floor: 3,
      site: "5e44e4bfe8b8974459eafba1",
    },
    {
      _id: "6098a4a384c4673d88dc827a",
      floor: 2,
      site: "5e44e4bfe8b8974459eafba1",
    },
  ]),
  fetchSurveys: jest.fn().mockResolvedValue([
    {
      monthName: "Jul 2021",
      dates: [
        {
          date: new Date("2021-07-07T00:00:00.000Z"),
          survey_name: "Survey 78",
        },
      ],
    },
    {
      monthName: "Jun 2021",
      dates: [
        {
          date: new Date("2021-06-16T00:00:00.000Z"),
          survey_name: "Survey 77",
        },
      ],
    },
  ]),
  fetchSurveyNodes: jest.fn().mockResolvedValue([]),
  getFloorSurveyExistence: jest.fn().mockResolvedValue(true),
  fetchMinimap: jest.fn().mockResolvedValue({
    floor: 3,
    site: "5e44e4bfe8b8974459eafba1",
    img_height: 825,
    img_width: 1248,
    image_url: "Anything",
    x_scale: 1,
    y_scale: 1,
    x_pixel_offset: 280,
    y_pixel_offset: 1,
    xy_flipped: false,
    floor_tag: "3",
  }),
}));

describe("Site Component", () => {
  test("renders without crashing", async () => {
    render(
      <Router>
        <Site {...mockSiteProps} />
      </Router>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("site-element")).toBeInTheDocument();
    });

    const floorDataText = await screen.findByText("Jun 2021");
    expect(floorDataText).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("floor-select-3"));
    const floorInput = screen.getByTestId("floor-tag-input");
    await waitFor(() => {
      expect(floorInput).toHaveValue("3");
    });
  });
});
