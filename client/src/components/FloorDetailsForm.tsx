import React from "react";
import { StateObject } from "../interfaces/StateObject";
import {
  FloorTagOrNameInputConfig,
  TagOrNameIdentifier,
} from "../interfaces/MiniMap/FloorTagOrNameInputConfig";

interface FloorDetailsFormProps {
  showForm?: boolean;
  minimapShown: boolean;
  minimapData: {
    floor_tag?: string;
    floor_name?: string;
  };
  floorNameState: StateObject<string>;
  floorTagState: StateObject<string>;
  submitVisibilityState: StateObject<boolean>;
  handleUpdateFloorTagAndName: () => Promise<void>;
}

/**
 * Component that handles the inputs and submissions for the floor tag and name.
 * Render depends on showForm condition. Default true if not provided.
 * @returns {JSX.Element}
 */
const FloorDetailsForm: React.FC<FloorDetailsFormProps> = ({
  showForm,
  minimapShown,
  minimapData,
  handleUpdateFloorTagAndName,
  floorNameState,
  floorTagState,
  submitVisibilityState,
}): JSX.Element => {
  if (showForm === undefined) showForm = true;
  if (!showForm) return <></>;

  const [floorName, setFloorName] = [
    floorNameState.value,
    floorNameState.setFn,
  ];
  const [floorTag, setFloorTag] = [floorTagState.value, floorTagState.setFn];

  const [submitVisibility, handleSetSubmitVisibility] = [
    submitVisibilityState.value,
    submitVisibilityState.setFn,
  ];
  console.log(floorTag);
  const inputs: FloorTagOrNameInputConfig[] = [
    {
      label: "Floor Name",
      value: floorName,
      tagOrName: "name",
      setter: setFloorName,
      id: "floor-name-input",
      cy: "floor-name-input",
    },
    {
      label: "Tag",
      value: floorTag,
      tagOrName: "tag",
      setter: setFloorTag,
      id: "floor-tag-input",
      cy: "floor-tag-input",
    },
  ];

  /**
   * Handles the input change event for both the floor name and floor tag inputs.
   *
   * @param e - The input change event.
   * @param setFnState - The state setter function for the input's value.
   * @param tagOrName - An identifier to distinguish between the floor name and
   *  floor tag inputs.
   * @param otherValue - The value of the other input. i.e. if e.target.value is "tag", this should be "name".
   * @param currentTag - The current value of the floor tag (from minimapData).
   * @param currentName - The current value of the floor name (from minimapData).
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFnState: React.Dispatch<React.SetStateAction<string>>,
    tagOrName: TagOrNameIdentifier,
    currentTag?: string,
    currentName?: string,
  ) => {
    setFnState(e.target.value);

    // Set submit btn to visible if input value is different than api's
    handleSetSubmitVisibility(
      tagOrName === "tag"
        ? e.target.value !== currentTag
        : e.target.value !== currentName,
    );
  };

  return (
    <>
      <form className="inlineLabels">
        <div className="nameInput">
          {inputs.map((input) => (
            <span key={input.id}>
              {!minimapShown && <label htmlFor={input.id}>{input.label}</label>}
              <input
                data-testid={input.id}
                value={input.value}
                data-cy={input.cy}
                id={input.id}
                name={input.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    e,
                    input.setter,
                    input.tagOrName,
                    minimapData?.floor_tag,
                    minimapData?.floor_name,
                  )
                }
              ></input>
            </span>
          ))}
        </div>
      </form>

      {submitVisibility && (
        <div className="submit-update" onClick={handleUpdateFloorTagAndName}>
          <span>Save</span>
        </div>
      )}
    </>
  );
};

export default FloorDetailsForm;
