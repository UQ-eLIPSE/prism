import React from "react";
import { EditNodeInput } from "../interfaces/MiniMap/EditNodeInput";
import EditNodePositionInput from "./EditNodePositionInput";

// * To be changed to use a Position type in future refactor.
interface EditNodeFormProps {
  rotationValue: number;
  setRotationValue: (rotation: number) => void;
  xPositionValue: number;
  setXPositionValue: (xPosition: number) => void;
  yPositionValue: number;
  setYPositionValue: (yPosition: number) => void;
  resetSelectedNode: () => void; // Clears selected node and sets editing to false.
  updateNode: () => Promise<void>;
}

// The minimum and maximum values for the rotation and position inputs.
const [ROTATION_MIN, ROTATION_MAX] = [0, 360];
const [POSITION_MIN, POSITION_MAX] = [0, 100];

/**
 * Form component for editing the position of a node.
 *
 * @param {EditNodeFormProps} props
 * @returns {JSX.Element}
 */
const EditNodeForm = (props: EditNodeFormProps): JSX.Element => {
  // Input configurations for the form. Please note that the label
  // for each must be unique since it is used as the input's id.
  const rotationInputConfig: EditNodeInput = {
    label: "orientation",
    value: props.rotationValue,
    setValue: props.setRotationValue,
    step: 15,
    symbol: <i className="fa-solid fa-rotate-right"></i>,
    bounds: {
      min: ROTATION_MIN,
      max: ROTATION_MAX,
    },
  };

  const xPositionInputConfig: EditNodeInput = {
    label: "x",
    value: props.xPositionValue,
    setValue: props.setXPositionValue,
    symbol: <i className="fa-solid fa-arrows-left-right"></i>,
    bounds: {
      min: POSITION_MIN,
      max: POSITION_MAX,
    },
  };

  const yPositionInputConfig: EditNodeInput = {
    label: "y",
    value: props.yPositionValue,
    setValue: props.setYPositionValue,
    symbol: <i className="fa-solid fa-arrows-up-down"></i>,
    bounds: {
      min: POSITION_MIN,
      max: POSITION_MAX,
    },
  };

  /**
   * Handles the input change event for a text input field.
   * Updates the state value based on the input value, with cycling behavior
   * between the minimum and maximum values.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event object.
   * @param {function} setStateValue - The state setter function to update the value.
   * @param {number} min - The minimum allowable value.
   * @param {number} max - The maximum allowable value.
   * @returns {void}
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setStateValue: (value: number) => void,
    min: number,
    max: number,
  ): void => {
    if (e.target.value === min.toString()) {
      setStateValue(max);
    } else if (e.target.value === max.toString() || e.target.value === "") {
      setStateValue(min);
    } else if (parseInt(e.target.value) <= max) {
      setStateValue(parseInt(e.target.value));
    }
  };

  /**
   * Handles form submission to update rotation and position of the targeted node.
   *
   * @param {React.FormEvent<HTMLFormElement>} e Submit event object
   * @param {Function} updateCallbackFn The function that handles the update of node.
   * @returns {void}
   */
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    updateCallbackFn: () => Promise<void>,
  ): void => {
    e.preventDefault();

    updateCallbackFn();
  };

  /**
   * Cancels form submission.
   *
   * @returns {void}
   */
  const handleCancelClick = (): void => {
    props.resetSelectedNode();
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, props.updateNode)}>
      <span>
        <label htmlFor={rotationInputConfig.label}>Orientation</label>
        <div>
          <EditNodePositionInput
            inputConfiguration={rotationInputConfig}
            handleInputChange={handleInputChange}
          />
        </div>
      </span>

      <span>
        <label htmlFor={xPositionInputConfig.label}>Coordinates</label>
        {[xPositionInputConfig, yPositionInputConfig].map(
          (inputConfig: EditNodeInput, idx: number) => (
            <div className="coords" key={idx}>
              <EditNodePositionInput
                inputConfiguration={inputConfig}
                handleInputChange={handleInputChange}
              />
            </div>
          ),
        )}
      </span>

      <span>
        <div className="buttons">
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </span>
    </form>
  );
};

export default EditNodeForm;
