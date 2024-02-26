import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MinimapUpdate from "../src/components/Minimap/MinimapUpload";
import { MinimapReturn } from "../src/components/Site";

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => "mock-url");
});

const mockMinimapData: MinimapReturn = {
  image_url: "",
  floor: 1,
  site: "",
  image_large_url: "",
  x_pixel_offset: 0,
  y_pixel_offset: 0,
  x_scale: 1,
  y_scale: 1,
  img_width: 100,
  img_height: 100,
  xy_flipped: false,
  __v: 0,
  floor_name: "",
  floor_tag: "",
  image: "",
};

const mockProps = {
  setMapHover: jest.fn(),
  setSelectedImage: jest.fn(),
  setImageUrl: jest.fn(),
  setPendingUpload: jest.fn(),
  mapHover: false,
  imageUrl: "",
  minimapdata: mockMinimapData,
};

describe("MinimapUpdate Component", () => {
  test("handles drag over event", () => {
    const { getByTestId } = render(<MinimapUpdate {...mockProps} />);
    const dropZone = getByTestId("drop-zone");
    fireEvent.dragOver(dropZone);
    expect(mockProps.setMapHover).toHaveBeenCalledWith(true);
  });

  test("handles drag leave event", () => {
    const { getByTestId } = render(<MinimapUpdate {...mockProps} />);
    const dropZone = getByTestId("drop-zone");
    fireEvent.dragLeave(dropZone);
    expect(mockProps.setMapHover).toHaveBeenCalledWith(false);
  });

  test("handles drop event", () => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const dataTransfer = { files: [mockFile] };
    const { getByTestId } = render(<MinimapUpdate {...mockProps} />);
    const dropZone = getByTestId("drop-zone");
    fireEvent.drop(dropZone, { dataTransfer });

    expect(mockProps.setMapHover).toHaveBeenCalledWith(false);
    expect(mockProps.setSelectedImage).toHaveBeenCalledWith(mockFile);
    expect(mockProps.setImageUrl).toHaveBeenCalled();
    expect(mockProps.setPendingUpload).toHaveBeenCalledWith(true);
  });
});
