import React from "react";
import { EditNodeInput } from "../interfaces/MiniMap/EditNodeInput";

interface EditNoteFormProps {
  rotationValue: number;
  setRotationValue: (rotation: number) => void;
}
const [ROTATION_MIN, ROTATION_MAX] = [0, 360];

const EditNodeForm = (props: EditNoteFormProps) => {
  const rotationInputConfig: EditNodeInput = {
    label: "orientation",
    value: props.rotationValue,
    setValue: props.setRotationValue,
    step: 15,
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

  return (
    <form>
      <span>
        <label htmlFor={rotationInputConfig.label}>Orientation</label>
        <div>
          <i className="fa-solid fa-rotate-right"></i>
          <input
            type="number"
            name={rotationInputConfig.label}
            id={rotationInputConfig.label}
            value={rotationInputConfig.value}
            step={rotationInputConfig?.step}
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
    </form>
  );
};

export default EditNodeForm;
