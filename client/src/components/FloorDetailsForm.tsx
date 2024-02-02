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
              onChange={(e) => {
                setFloorName(e.target.value);
                if (
                  ((!minimapData || !minimapData.floor_tag) &&
                    e.target.value) ||
                  (floorTag &&
                    e.target.value &&
                    minimapData &&
                    (floorTag != minimapData.floor_tag ||
                      e.target.value !== minimapData.floor_name))
                ) {
                  handleSetSubmitVisibility(true);
                } else {
                  handleSetSubmitVisibility(false);
                }
              }}
            ></input>
          </span>

          <span>
            {!minimapShown && <label htmlFor="floor-tag-input">Tag</label>}
            <input
              value={floorTag}
              data-cy="floor-tag-input"
              id="floor-tag-input"
              name="floor-tag-input"
              onChange={(e) => {
                if (e.target.value.length < 3) {
                  setFloorTag(e.target.value);
                  if (
                    ((!minimapData || !minimapData.floor_name) &&
                      e.target.value) ||
                    (e.target.value &&
                      floorName &&
                      minimapData &&
                      (e.target.value != minimapData.floor_tag ||
                        floorName !== minimapData.floor_name))
                  ) {
                    handleSetSubmitVisibility(true);
                  } else {
                    handleSetSubmitVisibility(false);
                  }
                }
              }}
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
