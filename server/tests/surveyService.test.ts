import { ObjectId } from "mongodb";
import { MinimapImages } from "../src/models/SurveyModel";
import { createMinimapImages } from "../src/service/SurveyService"; // Adjust the path to your function

// Mock MinimapImages model
jest.mock("../src/models/SurveyModel", () => ({
  MinimapImages: {
    create: jest.fn(),
  },
}));

describe("createMinimapImages", () => {
  const siteId = "5f8d0d55b54764421b7156cd";
  const floor = "1";

  beforeEach(() => {
    jest.clearAllMocks();
    (MinimapImages.create as jest.Mock).mockImplementation(
      (minimapImageproperties) => {
        const mockedMinimapImage = {
          ...minimapImageproperties,
          _id: new ObjectId(),
          site: new ObjectId(minimapImageproperties.site),
        };
        return mockedMinimapImage;
      },
    );
  });

  it("should create and return a new floor minimap image", async () => {
    const result = await createMinimapImages(siteId, floor);

    expect(MinimapImages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        floor: floor,
        floor_name: "Level " + floor,
        floor_tag: floor,
        site: expect.anything(),
        x_scale: 1,
        y_scale: 1,
        xy_flipped: false,
        x_pixel_offset: 0,
        y_pixel_offset: 0,
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        floor: floor,
        floor_name: "Level " + floor,
        floor_tag: floor,
        site: expect.any(ObjectId),
        x_scale: 1,
        y_scale: 1,
        xy_flipped: false,
        x_pixel_offset: 0,
        y_pixel_offset: 0,
      }),
    );
  });
});
