import React from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import { NodeComponentProps } from "../interfaces/NodeData";
import Icon from "@material-ui/core/Icon";

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
  configureRotationTo0,
  handleNodeClick,
}: NodeComponentProps): JSX.Element => {
  const getNodeStyle = (includeTransform = true) => {
    const isSelectedNode = node === selectedNode;
    return {
      top: `${isSelectedNode ? y : yPosition}%`,
      left: `${isSelectedNode ? x : xPosition}%`,
      transform: includeTransform ? configureRotation(node) : "none",
    };
  };
  console.log("config to 0", configureRotationTo0(node));
  console.log("config", configureRotation(node));
  return (
    <div
      key={index}
      className={node == selectedNode ? "currentSelectedNode" : ""}
    >
      {node.tiles_id === MinimapProps.currPanoId &&
        MinimapProps.config.enable.rotation && (
          <div
            className={`${MinimapStyles.nodeContainer} default-arrow`}
            // style={getNodeStyle(false)}
            style={{ ...getNodeStyle(false) }}
          >
            {node.tiles_id === MinimapProps.currPanoId &&
              MinimapProps.config.enable.rotation && (
                <Icon
                  className={`fa fa-arrow-up`}
                  style={{
                    transform: `scale(1.5) translate(-5px) rotate(${360 - 225}deg)`,
                  }}
                />
              )}
          </div>
        )}
      {node.tiles_id === MinimapProps.currPanoId &&
        MinimapProps.config.enable.rotation && (
          <div
            className={MinimapStyles.nodeContainer}
            style={{ ...getNodeStyle(false) }}
          >
            {node.tiles_id === MinimapProps.currPanoId &&
              MinimapProps.config.enable.rotation && (
                <Icon
                  className={`fa fa-arrow-up arrow`}
                  style={{
                    transform: ` scale(1.5)`,
                    color: "red",
                  }}
                />
              )}
          </div>
        )}

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
