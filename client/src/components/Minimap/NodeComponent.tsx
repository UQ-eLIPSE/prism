import React from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import {
  InitialViewParameters,
  NodeComponentProps,
} from "../../interfaces/NodeData";
import ArrowIcon from "./../ArrowIcon";
import { NewNode } from "../../interfaces/MiniMap/NewNode";

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
}: NodeComponentProps): JSX.Element => {
  const getNodeStyle = (includeTransform = true) => {
    const isSelectedNode = node === selectedNode;
    return {
      top: `${isSelectedNode ? y : yPosition}%`,
      left: `${isSelectedNode ? x : xPosition}%`,
      transform: includeTransform ? configureRotation(node) : "none",
    };
  };

  const radToDeg = (rad: number) => {
    return (rad * 180) / Math.PI;
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

  const yaw = getInitialParams(selectedNode)?.yaw;

  return (
    <div
      key={index}
      className={node == selectedNode ? "currentSelectedNode" : ""}
    >
      <div
        className={MinimapStyles.nodeContainer}
        style={{
          ...getNodeStyle(false),
          transform: `rotate(${radToDeg(yaw ?? 0)}deg)`,
          display: yaw !== undefined ? "block" : "none",
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
            className: "arrow",
            style: {
              transform: `scale(1.5)`,
            },
          }}
        />
      </div>
      <div
        className={MinimapStyles.nodeContainer}
        style={{
          ...getNodeStyle(false),
          transform: `rotate(${radToDeg(node.rotation)}deg)`,
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
            className: "arrow",
            style: {
              transform: `scale(1.5)`,
              color: "red",
            },
          }}
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
