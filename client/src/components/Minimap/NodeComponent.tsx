import React from "react";
import classNames from "classnames";
import MinimapStyles from "../../sass/partials/_minimap.module.scss";
import {
  InitialViewParameters,
  NodeComponentProps,
} from "../../interfaces/NodeData";
import ArrowIcon from "./../ArrowIcon";
import { NewNode } from "../../interfaces/MiniMap/NewNode";

// Helper
const radToDeg = (rad: number) => {
  return (rad * 180) / Math.PI;
};

/**
 * NodeComponent renders a single node within the minimap, including its position,
 * selection state, and any special indicators like rotation or enlargement.
 * It also handles the click events to select a node.
 *
 * @param {NodeComponentProps} props - The properties passed to the NodeComponent.
 * @returns {JSX.Element} The rendered node component.
 */
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
  isEditing,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currViewParams, // TODO: NEED FOR LATER
  nodesData,
  currRotation,
}: NodeComponentProps): JSX.Element => {
  const getNodeStyle = (includeTransform = true) => {
    const isSelectedNode = node === selectedNode;
    return {
      top: `${isSelectedNode ? y : yPosition}%`,
      left: `${isSelectedNode ? x : xPosition}%`,
      transform: includeTransform ? configureRotation(node) : "none",
    };
  };

  const getInitialParams = (
    node: NewNode | null,
  ): InitialViewParameters | null => {
    if (!node) return null;
    const tile_id = node.tiles_id;

    const selectedNodeData = nodesData.find(
      (node) => node.survey_node.tiles_id === tile_id,
    );
    const initialParams = selectedNodeData?.survey_node.initial_parameters;
    return !initialParams ? { yaw: 0, pitch: 0, fov: 0 } : initialParams;
  };

  return (
    <div
      key={index}
      className={node == selectedNode ? "currentSelectedNode" : ""}
    >
      <div
        className={MinimapStyles.nodeContainer}
        style={{
          ...getNodeStyle(false),
          transform: `rotate(${radToDeg(getInitialParams(node)?.yaw ?? 0)}deg)`,
          zIndex: 2,
        }}
      >
        <ArrowIcon
          showArrow={
            node.tiles_id === MinimapProps.currPanoId &&
            MinimapProps.config.enable.rotation &&
            isEditing
          }
          containerProps={{
            className: `${MinimapStyles.nodeArrowContainer} default-arrow`,
          }}
          iconProps={{
            className: "arrow arrow-yaw",
            style: {
              transform: `scale(1.5)`,
            },
          }}
          dataCy="yaw-arrow"
        />
      </div>
      <div
        className={MinimapStyles.nodeContainer}
        style={{
          ...getNodeStyle(false),
          // The current rotation is stored as the previous state of rotation.
          // The current rotation is updated when the user clicks on the node, which is why this check is necessary.
          transform: `rotate(${
            !selectedNode ? radToDeg(node.rotation) : currRotation
          }deg)`,
        }}
      >
        <ArrowIcon
          showArrow={
            node.tiles_id === MinimapProps.currPanoId &&
            MinimapProps.config.enable.rotation &&
            isEditing
          }
          containerProps={{
            className: `${MinimapStyles.nodeArrowContainer} default-arrow`,
            style: { transform: `scaleY(1.5)` },
          }}
          iconProps={{
            className: "arrow",
            style: {
              transform: `scale(1.5)`,
              color: "red",
              opacity: 0.5,
            },
          }}
          dataCy="rotation-offset-arrow"
        />
      </div>
      <div
        className={MinimapStyles.nodeContainer}
        style={getNodeStyle()}
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
            [MinimapStyles.infoNode]: node.info_hotspots?.length ?? 0,
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
        <div className={MinimapStyles.nodeTitle} style={getNodeStyle(false)}>
          {node.tiles_name}
        </div>
      )}
    </div>
  );
};

export default NodeComponent;
