import React from "react";
/**
 * Setting up an interface for the ToolModal properties such as the child element
 */
interface ToolModalProps {
  setHideState: () => void;
  childElement: React.ReactElement;
}

/**
 * The creator function where the ToolModal component
 * Takes the "childElement" ReactElement and displays the
 * "childElement" in a modal screen.
 */
function ToolModal({ setHideState, childElement }: ToolModalProps) {
  return (
    <div
      className="container toolContainer"
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="toolModal">{childElement}</div>
      <div
        className="toolCloseModal"
        onClick={() => {
          setHideState();
        }}
      ></div>
    </div>
  );
}

export default ToolModal;
