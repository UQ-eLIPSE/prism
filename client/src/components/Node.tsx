import React from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import MinimapUtils from "../utils/MinimapUtils";
import { MinimapConstants } from "../utils/MinimapConstants.d";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import { xAndYScaledCoordinates } from "../interfaces/MiniMap/XAndYScaledCoordinates";

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
      const nodeTitle = node.tiles_name;

      return (
        <div
          key={index}
          className={node == selectedNode ? "currentSelectedNode" : ""}
        >
          <div
            className={MinimapStyles.nodeContainer}
            style={{
              top: `${node == selectedNode ? y : yPosition}%`,
              left: `${node == selectedNode ? x : xPosition}%`,
              transform: configureRotation(node),
            }}
            key={node.tiles_id}
          >
            {node.tiles_id === MinimapProps.currPanoId &&
              MinimapProps.config.enable.rotation && (
                <div className="positionIndicator" />
              )}

            {node == selectedNode && (
              <div className="positionIndicator selected" />
            )}

            <div
              className={classNames(MinimapStyles.node, {
                [MinimapStyles.selectedNode]:
                  node.tiles_id === MinimapProps.currPanoId,
                [MinimapStyles.unselectedNode]:
                  node.tiles_id !== MinimapProps.currPanoId,
                [MinimapStyles.upscaled]: MinimapProps.minimapEnlarged,
                [MinimapStyles.scaled]: !MinimapProps.minimapEnlarged,
                [MinimapStyles.infoNode]: node.info_hotspots?.length ?? 0, //!!! Removed as it may be needed later with other infoNode functionality.
              })}
              key={node.tiles_id}
              id={node.tiles_id}
              onClick={(e): void => handleNodeClick(e, node)}
              data-cy={
                node.tiles_id === MinimapProps.currPanoId
                  ? "selected-node"
                  : "node"
              }
            />
          </div>
          {isMapEnlarged && (
            <div
              className={MinimapStyles.nodeTitle}
              style={{
                top: `${node == selectedNode ? y : yPosition}%`,
                left: `${node == selectedNode ? x : xPosition}%`,
              }}
            >
              {nodeTitle}
            </div>
          )}
        </div>
      );
    },
  );
}
export default NodeCollection;
