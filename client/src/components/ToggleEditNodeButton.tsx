import React from "react";
import { NewNode } from "../interfaces/MiniMap/NewNode";

interface ToggleEditNodeButtonProps {
  editing: boolean;
  selectedNode: NewNode | null; // Replace 'any' with the actual type of the node
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<NewNode | null>>;
  updateNodeInfo: () => void;
}

const ToggleEditNodeButton: React.FC<ToggleEditNodeButtonProps> = ({
  editing,
  selectedNode,
  setEditing,
  setSelectedNode,
  updateNodeInfo,
}) => {
  const canEdit: boolean = !!(editing && selectedNode);

  const handleClick = (): void => {
    setEditing((editing) => !editing);

    if (!editing) setSelectedNode(null);

    if (editing && selectedNode) {
      updateNodeInfo();
    }
  };

  const buttonClass =
    editing && !selectedNode ? "selecting" : canEdit ? "editing" : "";

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
