import React from "react";
import MinimapUtils from "../utils/MinimapUtils";
import { MinimapConstants } from "../utils/MinimapConstants.d";
import { xAndYScaledCoordinates } from "../interfaces/MiniMap/XAndYScaledCoordinates";
import NodeComponent from "./NodeComponent";
import { NodeCollectionProps } from "../interfaces/NodeData";

/**
 * Renders a collection of nodes as part of a minimap interface. Each node is represented
 * by a `NodeComponent`. This component handles the positioning and rendering logic for
 * each node based on provided data and configuration.
 *
 * @param {NodeCollectionProps} props - The props for the NodeCollection component.
 * @returns {JSX.Element} A div element wrapping all nodes rendered by the `NodeComponent`.
 */
function NodeCollection({
  renderData,
  selectedNode,
  MinimapProps,
  configureRotation,
  x,
  y,
  handleNodeClick,
}: NodeCollectionProps): JSX.Element {
  return (
    <div>
      {renderData.map((node, index) => {
        const scaledCoordinates: xAndYScaledCoordinates =
          MinimapUtils.getScaledNodeCoordinates(MinimapProps.minimapData, node);

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
      })}
    </div>
  );
}

export default NodeCollection;
