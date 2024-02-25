import "@testing-library/jest-dom";
import { NodeData } from "../src/interfaces/NodeData";
import MinimapUtils from "../src/components/Minimap/MinimapUtils";

const createMockNodeData = (overrides: Partial<NodeData> = {}): NodeData => {
  return {
    floor: 0,
    survey_node: {
      tiles_id: "",
      tiles_name: "",
      levels: [],
      face_size: 0,
      survey_name: "",
      initial_parameters: { fov: 0, pitch: 0, yaw: 0 },
      link_hotspots: [],
      info_hotspots: [],
      manta_link: "",
    },
    minimap_node: {
      id: "mock-id",
      node_number: 0,
      tiles_id: "mock-tiles-id",
      floor_id: "mock-floor-id",
      floor: 0,
      survey_node: {},
    },
    x: 0,
    y: 0,
    ...overrides,
  };
};

describe("findNearestNode", () => {
  it("should accurately find the nearest node based on x and y coordinates", () => {
    const mockNodeState = { x_position: 100, y_position: 100, rotation: 0 };
    const nodesData = [
      createMockNodeData({
        minimap_node: {
          tiles_id: "1",
          id: "1",
          node_number: 0,
          floor_id: "F1",
          floor: 1,
          survey_node: {},
        },
        x: 90,
        y: 90,
      }),
      createMockNodeData({
        minimap_node: {
          tiles_id: "2",
          id: "2",
          node_number: 0,
          floor_id: "F1",
          floor: 1,
          survey_node: {},
        },
        x: 150,
        y: 150,
      }),
      createMockNodeData({
        minimap_node: {
          tiles_id: "3",
          id: "3",
          node_number: 0,
          floor_id: "F1",
          floor: 1,
          survey_node: {},
        },
        x: 210,
        y: 210,
      }),
    ];

    const nearestNode = MinimapUtils.findNearestNode(nodesData, mockNodeState);
    expect(nearestNode).toEqual({
      nearestNodeId: "1",
      nearestNodeX: 90,
      nearestNodeY: 90,
    });
  });
});
