import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import MinimapUtils from "../utils/MinimapUtils";
import { MinimapConstants } from "../utils/MinimapConstants.d";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import { xAndYScaledCoordinates } from "../interfaces/MiniMap/XAndYScaledCoordinates";
import NodeComponent from "./NodeComponent";

/**
 * Props for the NodeCollection component.
 * @typedef {Object} NodeCollectionProps
 * @property {NewNode[]} nodeData - Array of node data to be displayed.
 * @property {NewNode|null} selectedNode - The node currently selected, if any.
 * @property {MinimapProps} MinimapProps - Props related to the minimap configuration.
 * @property {(node: NewNode) => string} configureRotation - Function to configure the rotation of nodes.
 * @property {number} x - The x coordinate for positioning the selected node.
 * @property {number} y - The y coordinate for positioning the selected node.
 * @property {(e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: NewNode) => void} handleNodeClick - Function to handle click events on nodes.
 */
interface NodeCollectionProps {
  nodeData: NewNode[];
  selectedNode: NewNode | null;
  MinimapProps: MinimapProps;
  configureRotation: (node: NewNode) => string;
  x: number;
  y: number;
  handleNodeClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    node: NewNode,
  ) => void;
}

/**
 * Renders a collection of nodes as part of a minimap interface. Each node is represented
 * by a `NodeComponent`. This component handles the positioning and rendering logic for
 * each node based on provided data and configuration.
 *
 * @param {NodeCollectionProps} props - The props for the NodeCollection component.
 * @returns {JSX.Element} A div element wrapping all nodes rendered by the `NodeComponent`.
 */
function NodeCollection({
  nodeData,
  selectedNode,
  MinimapProps,
  configureRotation,
  x,
  y,
  handleNodeClick,
}: NodeCollectionProps): JSX.Element {
  return (
    <div>
      {(selectedNode ? [...nodeData, selectedNode] : nodeData).map(
        (node, index) => {
          const scaledCoordinates: xAndYScaledCoordinates =
            MinimapUtils.getScaledNodeCoordinates(
              MinimapProps.minimapData,
              node,
            );

          const adjustPosition = (position: number): number => {
            if (position > MinimapConstants.UPPER_BOUND) {
              return MinimapConstants.UPPER_ADJUST;
            } else if (position < MinimapConstants.LOWER_BOUND) {
              return MinimapConstants.LOWER_ADJUST;
            }
            return position;
          };

          const xPosition: number = adjustPosition(
            scaledCoordinates.nodeXScaledCoordinate,
          );
          const yPosition: number = adjustPosition(
            scaledCoordinates.nodeYScaledCoordinate,
          );

          const isMapEnlarged = MinimapProps.minimapEnlarged;

          return (
            <NodeComponent
              key={index} // Ensure key is here for optimal rendering
              index={index}
              node={node}
              selectedNode={selectedNode}
              y={y}
              x={x}
              yPosition={yPosition}
              xPosition={xPosition}
              MinimapProps={MinimapProps}
              isMapEnlarged={isMapEnlarged}
              configureRotation={configureRotation}
              handleNodeClick={handleNodeClick}
            />
          );
        },
      )}
    </div>
  );
}

export default NodeCollection;
