import { ISurveyNode, IMinimapConversion } from "../../src/models/SurveyModel";
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

export { mockMiniconverions, mockSurveyNodes, result };
