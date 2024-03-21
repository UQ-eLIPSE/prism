/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import { StateObject } from "../interfaces/StateObject";
import { NodeData } from "../interfaces/NodeData";

interface ToggleEditNodeButtonProps {
  isEditingState: StateObject<boolean>;
  selectedNodeState: StateObject<NewNode | null>;
  updateNodeInfo: () => Promise<void>;
  currPanoId: string;
  nodesData: NodeData[];
  handleEditCurrentViewedNode: (node: any) => void;
}

/**
 * Button to toggle the edit state of a node.
 * @returns {JSX.Element}
 */
const ToggleEditNodeButton: React.FC<ToggleEditNodeButtonProps> = ({
  isEditingState,
  selectedNodeState,
  updateNodeInfo,
  currPanoId,
  nodesData,
  handleEditCurrentViewedNode,
}): JSX.Element => {
  const [isEditing, setIsEditing] = [
    isEditingState.value,
    isEditingState.setFn,
  ];
  const [selectedNode, setSelectedNode] = [
    selectedNodeState.value,
    selectedNodeState.setFn,
  ];

  const getNode = (panoId: string, nodes: NodeData[]): NodeData => {
    const node = nodes.find(
      (node: NodeData) => node.survey_node.tiles_id === panoId,
    );

    return node ? node : nodes[0];
  };

  const canEdit: boolean = !!(isEditing && selectedNode);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setIsEditing((isEditing: boolean) => !isEditing);

    const node = getNode(currPanoId, nodesData);

    const newNode: NewNode = {
      floor: node.minimap_node.floor,
      node_number: node.minimap_node.node_number,
      survey_node: node.minimap_node.survey_node,
      site: node.minimap_node.site ?? "",
      tiles_id: node.survey_node.tiles_id,
      tiles_name: node.survey_node.tiles_name,
      x: node.x,
      x_scale: node.x_scale,
      y: node.y,
      y_scale: node.y_scale,
      rotation: node.rotation ?? 0,
      info_hotspots: node.survey_node.info_hotspots,
    };

    handleEditCurrentViewedNode(newNode);

    canEdit && updateNodeInfo();
  };

  const buttonClass =
    isEditing && !selectedNode ? "selecting" : canEdit ? "editing" : "";

  const iconClass = canEdit ? "fa-floppy-disk" : "fa-pen-to-square";
  const buttonText = `${canEdit ? "Save" : "Edit"} Node`;

  return (
    <button
      onClick={handleClick}
      className={`editButton ${buttonClass}`}
      data-cy="edit-save-button"
    >
      <i className={`fa-solid ${iconClass}`}></i>
      <p>{buttonText}</p>
    </button>
  );
};

export default ToggleEditNodeButton;
