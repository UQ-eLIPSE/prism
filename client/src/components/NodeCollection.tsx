import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import MinimapUtils from "../utils/MinimapUtils";
import { MinimapConstants } from "../utils/MinimapConstants.d";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import { xAndYScaledCoordinates } from "../interfaces/MiniMap/XAndYScaledCoordinates";
import NodeComponent from "./NodeComponent";

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

function NodeCollection({
  nodeData,
  selectedNode,
  MinimapProps,
  configureRotation,
  x,
  y,
  handleNodeClick,
}: NodeCollectionProps): React.JSX.Element[] {
  return (selectedNode ? [...nodeData, selectedNode] : nodeData).map(
    (node, index) => {
      const scaledCoordinates: xAndYScaledCoordinates =
        MinimapUtils.getScaledNodeCoordinates(MinimapProps.minimapData, node);

      function adjustPosition(position: number): number {
        if (position > MinimapConstants.UPPER_BOUND) {
          return MinimapConstants.UPPER_ADJUST;
        } else if (position < MinimapConstants.LOWER_BOUND) {
          return MinimapConstants.LOWER_ADJUST;
        }
        return position;
      }

      const xPosition: number = adjustPosition(
        scaledCoordinates.nodeXScaledCoordinate,
      );
      const yPosition: number = adjustPosition(
        scaledCoordinates.nodeYScaledCoordinate,
      );

      const isMapEnlarged = MinimapProps.minimapEnlarged;

      return (
        <NodeComponent
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
  );
}
export default NodeCollection;
