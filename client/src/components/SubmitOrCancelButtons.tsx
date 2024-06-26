import React from "react";

interface SubmitOrCancelButtonsProps {
  showCondition?: boolean;
  handleSubmit: () => void | Promise<void>;
  handleCancel: () => void;
}

/**
 * A component that displays Submit and Cancel options
 * Renders even if showCondition prop is not provided.
 * @returns {JSX.Element} Submit or Cancel options
 */
const SubmitOrCancelButtons = ({
  showCondition = true,
  handleSubmit,
  handleCancel,
}: SubmitOrCancelButtonsProps): JSX.Element | null => {
  return showCondition ? (
    <>
      <div className="submit-update" onClick={handleSubmit}>
        <span>Submit</span>
      </div>
      <div className="cancel-update" onClick={handleCancel}>
        <span>Cancel</span>
      </div>
    </>
  ) : null;
};

export default SubmitOrCancelButtons;
