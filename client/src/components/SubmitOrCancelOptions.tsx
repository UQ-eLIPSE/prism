import React from "react";

interface SubmitOrCancelOptionsProps {
  showCondition?: boolean;
  handleSubmit: () => void;
  handleCancel: () => void;
}

/**
 * A component that displays Submit and Cancel options
 * Renders if showCondition prop is not provided.
 * @returns {JSX.Element} Submit or Cancel options
 */
const SubmitOrCancelOptions = ({
  showCondition = true,
  handleSubmit,
  handleCancel,
}: SubmitOrCancelOptionsProps): JSX.Element | null => {
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

export default SubmitOrCancelOptions;
