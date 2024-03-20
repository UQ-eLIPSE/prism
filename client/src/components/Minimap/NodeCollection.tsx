import React from "react";
import MinimapUtils from "./MinimapUtils";
import { MinimapConstants } from "./MinimapConstants.d";
import NodeComponent from "./NodeComponent";
import { NodeCollectionProps } from "../../interfaces/NodeData";

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
  currViewParams,
  nodesData,
  currRotation,
  config,
}: NodeCollectionProps): JSX.Element {
  return (
    <div>
      {renderData.map((node, index) => {
        const { nodeXScaledCoordinate, nodeYScaledCoordinate } =
          MinimapUtils.getScaledNodeCoordinates(MinimapProps.minimapData, node);

        const adjustPosition = (position: number): number => {
          if (position > MinimapConstants.UPPER_BOUND) {
            return MinimapConstants.UPPER_ADJUST;
          } else if (position < MinimapConstants.LOWER_BOUND) {
            return MinimapConstants.LOWER_ADJUST;
          }
          return position;
        };
        const xPosition: number = adjustPosition(nodeXScaledCoordinate);

        const yPosition: number = adjustPosition(nodeYScaledCoordinate);

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
            isMapEnlarged={MinimapProps.minimapEnlarged}
            configureRotation={configureRotation}
            handleNodeClick={handleNodeClick}
            currViewParams={currViewParams}
            nodesData={nodesData}
            currRotation={currRotation}
            config={config}
          />
        );
      })}
    </div>
  );
}

export default NodeCollection;
