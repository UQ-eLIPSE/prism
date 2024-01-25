import React from "react";
import { EditNodeInput } from "../interfaces/MiniMap/EditNodeInput";

interface EditNoteFormProps {
  rotationValue: number;
  setRotationValue: (rotation: number) => void;
  xPositionValue: number;
  setXPositionValue: (xPosition: number) => void;
  yPositionValue: number;
  setYPositionValue: (yPosition: number) => void;
  resetSelectedNode: () => void;
  updateNode: () => Promise<void>;
}
const [ROTATION_MIN, ROTATION_MAX] = [0, 360];
const [POSITION_MIN, POSITION_MAX] = [0, 100];

const EditNodeForm = (props: EditNoteFormProps) => {
  const rotationInputConfig: EditNodeInput = {
    label: "orientation",
    value: props.rotationValue,
    setValue: props.setRotationValue,
    step: 15,
    symbol: <i className="fa-solid fa-rotate-right"></i>,
  };

  const xPositionInputConfig: EditNodeInput = {
    label: "x",
    value: props.xPositionValue,
    setValue: props.setXPositionValue,
    symbol: <i className="fa-solid fa-arrows-left-right"></i>,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const yPositionInputConfig: EditNodeInput = {
    label: "y",
    value: props.yPositionValue,
    setValue: props.setYPositionValue,
    symbol: <i className="fa-solid fa-arrows-up-down"></i>,
  };

  /**
   * Handles the input change event for a text input field.
   * Updates the state value based on the input value, with cycling behavior between the minimum and maximum values.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event object.
   * @param {function} setStateValue - The state setter function to update the value.
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @returns {void}
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setStateValue: (value: number) => void,
    min: number,
    max: number,
  ): void => {
    const parsedValue = parseInt(e.target.value);
    if (parsedValue <= min || e.target.value === "") {
      setStateValue(max);
    } else if (parsedValue >= max) {
      setStateValue(min);
    } else if (parseInt(e.target.value) < 360) {
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
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    updateCallbackFn: () => Promise<void>,
  ): Promise<void> => {
    e.preventDefault();
    props.resetSelectedNode();

    updateCallbackFn();
  };

  /**
   * Cancels form submission.
   * @returns {void}
   */
  const handleCancelClick = () => {
    props.resetSelectedNode();
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, props.updateNode)}>
      <span>
        <label htmlFor={rotationInputConfig.label}>Orientation</label>
        <div>
          {rotationInputConfig.symbol}
          <input
            type="number"
            name={rotationInputConfig.label}
            id={rotationInputConfig.label}
            value={rotationInputConfig.value}
            step={rotationInputConfig?.step}
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInputChange(
                e,
                rotationInputConfig.setValue,
                ROTATION_MIN,
                ROTATION_MAX,
              );
            }}
          />
        </div>
      </span>

      <span>
        <label htmlFor={xPositionInputConfig.label}>Coordinates</label>
        {[xPositionInputConfig, yPositionInputConfig].map(
          (inputConfig, idx) => {
            return (
              <div className="coords" key={idx}>
                {inputConfig.symbol}
                <input
                  type="number"
                  name={inputConfig.label}
                  id={inputConfig.label}
                  value={Math.round(inputConfig.value)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleInputChange(
                      e,
                      inputConfig.setValue,
                      POSITION_MIN,
                      POSITION_MAX,
                    );
                  }}
                  min={POSITION_MIN}
                  max={POSITION_MAX}
                />
              </div>
            );
          },
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
