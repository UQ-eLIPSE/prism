import React from "react";

interface StateObject<T> {
  value: T;
  setFn: React.Dispatch<React.SetStateAction<T>>;
}

interface FloorDetailsFormProps {
  minimapShown: boolean;
  minimapData: {
    floor_tag?: string;
    floor_name?: string;
  };
  floorNameState: StateObject<string>;
  floorTagState: StateObject<string>;
  submitVisibilityState: StateObject<boolean>;

  handleUpdateFloorTagAndName: () => void;
}

const FloorDetailsForm: React.FC<FloorDetailsFormProps> = ({
  minimapShown,
  minimapData,
  handleUpdateFloorTagAndName,
  floorNameState,
  floorTagState,
  submitVisibilityState,
}) => {
  const [floorName, setFloorName] = [
    floorNameState.value,
    floorNameState.setFn,
  ];
  const [floorTag, setFloorTag] = [floorTagState.value, floorTagState.setFn];

  const [submitVisibility, handleSetSubmitVisibility] = [
    submitVisibilityState.value,
    submitVisibilityState.setFn,
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFunction: React.Dispatch<React.SetStateAction<string>>,
    otherValue: string,
    currentTag?: string,
    currentName?: string,
  ) => {
    const newValue = e.target.value;
    setFunction(newValue);

    const isTagChanged = newValue !== currentTag;
    const isNameChanged = otherValue !== currentName;

    // If either the tag or name has been changed, show the submit button
    handleSetSubmitVisibility(isTagChanged || isNameChanged);
  };

  return (
    <>
      <span className="inlineLabels">
        <div className="nameInput">
          <span>
            {!minimapShown && (
              <label htmlFor="floor-name-input">Floor Name</label>
            )}
            <input
              value={floorName}
              data-cy="floor-name-input"
              id="floor-name-input"
              name="floor-name-input"
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFloorName,
                  floorTag,
                  minimapData?.floor_tag,
                  minimapData?.floor_name,
                )
              }
            ></input>
          </span>

          <span>
            {!minimapShown && <label htmlFor="floor-tag-input">Tag</label>}
            <input
              value={floorTag}
              data-cy="floor-tag-input"
              id="floor-tag-input"
              name="floor-tag-input"
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFloorTag,
                  floorName,
                  minimapData?.floor_tag,
                  minimapData?.floor_name,
                )
              }
            ></input>
          </span>
        </div>
      </span>

      {submitVisibility && (
        <div className="submit-update" onClick={handleUpdateFloorTagAndName}>
          <span>Save</span>
        </div>
      )}
    </>
  );
};

export default FloorDetailsForm;
