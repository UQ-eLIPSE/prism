import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import classNames from "classnames";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import MinimapStyles from "../sass/partials/_minimap.module.scss";

interface NodeComponent {
  index: number;
  node: NewNode;
  selectedNode: NewNode | null;
  y: number;
  x: number;
  yPosition: number;
  xPosition: number;
  MinimapProps: MinimapProps;
  isMapEnlarged: boolean;
  configureRotation: (node: NewNode) => string;
  handleNodeClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    node: NewNode,
  ) => void;
}

const NodeComponent = ({
  index,
  node,
  selectedNode,
  y,
  x,
  yPosition,
  xPosition,
  MinimapProps,
  isMapEnlarged,
  configureRotation,
  handleNodeClick,
}: NodeComponent): JSX.Element => {
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

        {node == selectedNode && <div className="positionIndicator selected" />}

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
            node.tiles_id === MinimapProps.currPanoId ? "selected-node" : "node"
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
          {node.tiles_name}
        </div>
      )}
    </div>
  );
};

export default NodeComponent;
