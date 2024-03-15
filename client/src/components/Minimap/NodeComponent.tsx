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

// There is a default offset for the node's RADAR VIEW on the minimap.
// This defaults to point right side.
const ROTATION_OFFSET = 90;

/**
 * Converts rotation style to counter rotation style.
 * Used to make the node look like it hasn't changed from the rotation.
 * @param {string} rotationStyle - A CSS rotation style string (e.g., "rotate(45rad)")
 * @returns {string} - A CSS rotation style string with the counter rotation (e.g., "rotate(-45rad)")
 */
export const getCounterRotationStyle = (rotationStyle: string): string => {
  // Regex to extract rotation value
  const rotationMatch = /rotate\(([^)]+)rad\)/.exec(rotationStyle);

  if (!rotationMatch) return rotationStyle;
  // rotation match e.g.
  // ['rotate(1.8325956209839993rad)', '1.8325956209839993', index: 0, input:
  // 'rotate(1.8325956209839993rad)', groups: undefined]
  const rotationValueInRadians = parseFloat(rotationMatch[1]);
  const counterRotationStyle = `rotate(${-rotationValueInRadians}rad)`;

  return counterRotationStyle;
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
  config,
}: NodeComponentProps): JSX.Element => {
  const getNodeStyle = (includeTransform = true) => {
    const isSelectedNode = node === selectedNode;
    return {
      top: `${isSelectedNode ? y : yPosition}%`,
      left: `${isSelectedNode ? x : xPosition}%`,
      transform: includeTransform ? configureRotation(node) : "none",
    };
  };

  /**
   * Used to rotate the red and black arrows in the minimap.
   * @returns {number} - The initial POV rotation in degrees.
   */
  const getInitialPOVRotationDegrees = (offset: number = 0): number => {
    // isNaN checks needed because sometimes, the node rotation value is being read as
    // undefined...

    // This is the initial node rotation read from the db
    const nodeRotationInDegrees = isNaN(radToDeg(node.rotation))
      ? 0
      : radToDeg(node.rotation);

    // This is the current rotation set by the user through the popup form.
    const currRotationInDegrees = isNaN(currRotation) ? 0 : currRotation;

    const result = !selectedNode
      ? nodeRotationInDegrees
      : currRotationInDegrees;

    console.log(
      "initialrotationoffset",
      config.initial_settings.rotation_offset,
    );

    return (
      result +
      offset +
      (isNaN(radToDeg(config.initial_settings.rotation_offset))
        ? 0
        : radToDeg(config.initial_settings.rotation_offset))
    );
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
          transform: `rotate(${radToDeg(getInitialParams(node)?.yaw ?? 0) + getInitialPOVRotationDegrees(ROTATION_OFFSET)}deg)`,
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
          transform: `rotate(${getInitialPOVRotationDegrees(ROTATION_OFFSET)}deg)`,
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
        data-cy={
          node == selectedNode ? "node-container-selected" : "node-container"
        }
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
          style={{
            // needed to make the node look like it hasn't changed from the rotation
            transform: getCounterRotationStyle(getNodeStyle().transform),
          }}
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
