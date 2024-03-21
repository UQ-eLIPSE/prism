import { IMapPins } from "../../src/components/MapPins/MapPinsModel";
import {
  ISurveyNode,
  IMinimapConversion,
  IMinimapNode,
  IMinimapImages,
  IHotspotDescription,
  IContentSection,
  IHeaderInfo,
} from "../../src/models/SurveyModel";
import mongoose from "mongoose";

const mockSurveyNodes: ISurveyNode[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    manta_link: "stringtest",
    date: "2022-01-01",
    node_number: 1,
    survey_name: "Test Survey",
    tiles_id: "tiles-123",
    tiles_name: "Test Tiles",
    initial_parameters: {
      pitch: 0,
      yaw: 0,
      fov: 90,
    },
    link_hotspots: [
      {
        yaw: 0.2824,
        pitch: 0.1177,
        rotation: 0,
        target: "1-prism_uat_level2",
      },
    ],
    info_hotspots: [
      {
        yaw: 0.2824,
        pitch: 0.1177,
        rotation: 0,
        target: "info-123",
        info_id: "info-123",
      },
    ],
    levels: [1],
    face_size: 1024,
    site: 123,
  },
] as ISurveyNode[];

const mockMinimapImages: IMinimapImages[] = [
  {
    floor: 1,
    floor_name: "Ground Floor",
    floor_tag: "G",
    image_url: "https://example.com/floor1.png",
    image_large_url: "https://example.com/floor1_large.png",
    x_pixel_offset: 50,
    y_pixel_offset: 100,
    x_scale: 0.5,
    y_scale: 0.5,
    img_width: 1024,
    img_height: 768,
    xy_flipped: false,
    site: 123,
  },
  {
    floor: 2,
    floor_name: "First Floor",
    floor_tag: "F1",
    image_url: "https://example.com/floor2.png",
    image_large_url: "https://example.com/floor2_large.png",
    x_pixel_offset: 60,
    y_pixel_offset: 110,
    x_scale: 0.6,
    y_scale: 0.6,
    img_width: 1124,
    img_height: 868,
    xy_flipped: true,
    site: 123,
  },
  {
    floor: 3,
    floor_name: "Second Floor",
    floor_tag: "F2",
    image_url: "https://example.com/floor3.png",
    image_large_url: "https://example.com/floor3_large.png",
    x_pixel_offset: 70,
    y_pixel_offset: 120,
    x_scale: 0.7,
    y_scale: 0.7,
    img_width: 1224,
    img_height: 968,
    xy_flipped: false,
    site: 123,
  },
] as IMinimapImages[];

const mockMinimapNode: IMinimapNode[] = [
  {
    node_number: 1,
    title: "Kitchen",
    description: "Where the kitchen is",
    survey_node: {
      manta_link: "stringtest",
      date: "2022-01-01",
      node_number: 1,
      survey_name: "Survey 1",
      tiles_id: "tiles-123",
      tiles_name: "Test Tiles",
      initial_parameters: {
        pitch: 0,
        yaw: 0,
        fov: 90,
      },
      link_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "1-prism_uat_level2",
        },
      ],
      info_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "info-123",
          info_id: "info-123",
        },
      ],
      levels: [1],
      face_size: 1024,
      site: 123,
    },
    floor: 1,
    site: 123,
  },
  {
    node_number: 1,
    title: "Kitchen",
    description: "Where the kitchen is",
    survey_node: {
      manta_link: "stringtest",
      date: "2023-01-01",
      node_number: 1,
      survey_name: "Survey 2",
      tiles_id: "tiles-123",
      tiles_name: "Test Tiles",
      initial_parameters: {
        pitch: 0,
        yaw: 0,
        fov: 90,
      },
      link_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "1-prism_uat_level2",
        },
      ],
      info_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "info-123",
          info_id: "info-123",
        },
      ],
      levels: [1, 2],
      face_size: 1024,
      site: 123,
    },
    floor: 2,
    site: 123,
  },
] as IMinimapNode[];

const mockMiniconverions: IMinimapConversion[] = [
  {
    floor: 0,
    x: 1,
    y: 1,
    x_scale: 1,
    y_scale: 1,
    survey_node: {
      manta_link: "stringtest",
      date: "2022-01-01",
      node_number: 1,
      survey_name: "Test Survey",
      tiles_id: "tiles-123",
      tiles_name: "Test Tiles",
      initial_parameters: {
        pitch: 0,
        yaw: 0,
        fov: 90,
      },
      link_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "1-prism_uat_level2",
        },
      ],
      info_hotspots: [
        {
          yaw: 0.2824,
          pitch: 0.1177,
          rotation: 0,
          target: "info-123",
          info_id: "info-123",
        },
      ],
      levels: [1],
      face_size: 1024,
      site: 123,
    },
    minimap_node: {
      node_number: 1,
      title: "string",
      description: "string",
      survey_node: {
        manta_link: "stringtest",
        date: "2022-01-01",
        node_number: 1,
        survey_name: "Test Survey",
        tiles_id: "tiles-123",
        tiles_name: "Test Tiles",
        initial_parameters: {
          pitch: 0,
          yaw: 0,
          fov: 90,
        },
        link_hotspots: [
          {
            yaw: 0.2824,
            pitch: 0.1177,
            rotation: 0,
            target: "1-prism_uat_level2",
          },
        ],
        info_hotspots: [
          {
            yaw: 0.2824,
            pitch: 0.1177,
            rotation: 0,
            target: "info-123",
            info_id: "info-123",
          },
        ],
        levels: [1],
        face_size: 1024,
        site: 123,
      },
      floor: 0,
      site: 0,
    },
    site: 0,
    rotation: 0,
  },
] as IMinimapConversion[];

const result = {
  message: "",
  payload: [
    {
      floor: 0,
      minimap_node: {
        description: "string",
        floor: 0,
        node_number: 1,
        site: 0,
        survey_node: {
          date: "2022-01-01",
          face_size: 1024,
          info_hotspots: [
            {
              info_id: "info-123",
              pitch: 0.1177,
              rotation: 0,
              target: "info-123",
              yaw: 0.2824,
            },
          ],
          initial_parameters: { fov: 90, pitch: 0, yaw: 0 },
          levels: [1],
          link_hotspots: [
            {
              pitch: 0.1177,
              rotation: 0,
              target: "1-prism_uat_level2",
              yaw: 0.2824,
            },
          ],
          manta_link: "stringtest",
          node_number: 1,
          site: 123,
          survey_name: "Test Survey",
          tiles_id: "tiles-123",
          tiles_name: "Test Tiles",
        },
        title: "string",
      },
      rotation: 0,
      site: 0,
      survey_node: {
        date: "2022-01-01",
        face_size: 1024,
        info_hotspots: [
          {
            info_id: "info-123",
            pitch: 0.1177,
            rotation: 0,
            target: "info-123",
            yaw: 0.2824,
          },
        ],
        initial_parameters: { fov: 90, pitch: 0, yaw: 0 },
        levels: [1],
        link_hotspots: [
          {
            pitch: 0.1177,
            rotation: 0,
            target: "1-prism_uat_level2",
            yaw: 0.2824,
          },
        ],
        manta_link: "stringtest",
        node_number: 1,
        site: 123,
        survey_name: "Test Survey",
        tiles_id: "tiles-123",
        tiles_name: "Test Tiles",
      },
      x: 1,
      x_scale: 1,
      y: 1,
      y_scale: 1,
    },
  ],
  success: true,
};

const mockMapPins: Partial<IMapPins>[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    x: 10,
    y: 20,
    icon: "sample_icon",
    cover_image: "sample_cover_image",
    site: new mongoose.Types.ObjectId(),
    name: "sample_name",
    enabled: true,
    site_name: "sample_site_name",
    external_url: "www.sampleurl.com",
    sitemap: "sample_sitemap",
  },
];

const mockHotSpotDescription: IHotspotDescription[] = [
  {
    _id: "60d6ec5a4ef0b2c8c7ec5958", // Mock MongoDB ObjectId
    header: {
      _id: "60d6ec5a4ef0b2c8c7ec5957", // Mock MongoDB ObjectId
      main_img_url: "https://example.com/image.jpg",
      label_title: "Example Title",
    } as IHeaderInfo,
    contents: [
      {
        _id: "60d6ec5a4ef0b2c8c7ec5956", // Mock MongoDB ObjectId
        title: "Example Content Title",
        content: "Example content text",
      },
      {
        _id: "60d6ec5a4ef0b2c8c7ec5955", // Mock MongoDB ObjectId
        title: "Another Content Title",
        content: "Another example content text",
      },
    ] as IContentSection[],
    tiles_id: "exampleTilesId",
    info_id: "exampleInfoId",
  } as IHotspotDescription,
];

export {
  mockMiniconverions,
  mockSurveyNodes,
  result,
  mockMapPins,
  mockMinimapNode,
  mockMinimapImages,
  mockHotSpotDescription,
};
