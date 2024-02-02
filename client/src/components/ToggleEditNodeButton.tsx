import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import { StateObject } from "../interfaces/StateObject";

interface ToggleEditNodeButtonProps {
  isEditingState: StateObject<boolean>;
  selectedNodeState: StateObject<NewNode | null>;
  updateNodeInfo: () => Promise<void>;
}

const ToggleEditNodeButton: React.FC<ToggleEditNodeButtonProps> = ({
  isEditingState,
  selectedNodeState,
  updateNodeInfo,
}) => {
  const [isEditing, setIsEditing] = [
    isEditingState.value,
    isEditingState.setFn,
  ];
  const [selectedNode, setSelectedNode] = [
    selectedNodeState.value,
    selectedNodeState.setFn,
  ];

  const canEdit: boolean = !!(isEditing && selectedNode);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    setIsEditing((isEditing: boolean) => !isEditing);

    if (!isEditing) setSelectedNode(null);

    if (isEditing && selectedNode) {
      updateNodeInfo();
    }
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
