import React from "react";
import { EditNodeInput } from "../interfaces/MiniMap/EditNodeInput";

interface EditNodePositionInputProps {
  inputConfiguration: EditNodeInput;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setStateValue: (value: number) => void,
    min: number,
    max: number,
  ) => void;
}

const EditNodePositionInput = ({
  inputConfiguration,
  handleInputChange,
}: EditNodePositionInputProps) => {
  const { min, max } = inputConfiguration.bounds;
  return (
    <>
      {inputConfiguration.symbol}
      <input
        type="number"
        name={inputConfiguration.label}
        id={inputConfiguration.label}
        value={Math.round(inputConfiguration.value)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          handleInputChange(e, inputConfiguration.setValue, min, max);
        }}
        min={min}
        max={max}
      />
    </>
  );
};

export default EditNodePositionInput;
