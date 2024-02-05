import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import classNames from "classnames";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import MinimapStyles from "../sass/partials/_minimap.module.scss";

/**
 * Props for the NodeComponent.
 * @typedef {Object} NodeComponentProps
 * @property {number} index - The index of the node in the collection.
 * @property {NewNode} node - The current node data.
 * @property {NewNode|null} selectedNode - The node currently selected, if any.
 * @property {number} y - The y coordinate for the selected node.
 * @property {number} x - The x coordinate for the selected node.
 * @property {number} yPosition - The y position for the node, adjusted for scaling.
 * @property {number} xPosition - The x position for the node, adjusted for scaling.
 * @property {MinimapProps} MinimapProps - Props related to the minimap configuration.
 * @property {boolean} isMapEnlarged - Flag indicating if the minimap is enlarged.
 * @property {(node: NewNode) => string} configureRotation - Function to configure the rotation of the node.
 * @property {(e: React.MouseEvent<HTMLDivElement, MouseEvent>, node: NewNode) => void} handleNodeClick - Function to handle click events on the node.
 */
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
