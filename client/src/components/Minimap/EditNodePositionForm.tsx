import React, { useEffect, useRef, useState } from "react";
import { EditNodeInput } from "../../interfaces/MiniMap/EditNodeInput";
import EditNodePositionInput from "./EditNodePositionInput";
import { StateObject } from "../../interfaces/StateObject";
import { NewNode } from "../../interfaces/MiniMap/NewNode";
import {
  InitialViewParameters,
  NodeConfiguration,
  NodeData,
} from "../../interfaces/NodeData";
import { Icon } from "@material-ui/core";

// * To be changed to use a Position type in future refactor.
interface EditNodeFormProps {
  rotationState: StateObject<number>;
  xPositionState: StateObject<number>;
  yPositionState: StateObject<number>;
  tileNameState: StateObject<string>;
  resetSelectedNode: () => void; // Clears selected node and sets editing to false.
  updateNode: () => Promise<void>;
  selectedNode: NewNode | null;
  nodesData: NodeData[];
}

// The minimum and maximum values for the rotation and position inputs.
const [ROTATION_MIN, ROTATION_MAX] = [0, 360];
const [POSITION_MIN, POSITION_MAX] = [0, 100];
const ROTATION_STEP: number = 15;

const getValidNumber = (value: number, defaultValue: number = 0): number => {
  return isNaN(value) ? defaultValue : value;
};

/**
 * Form component for editing the position of a node.
 *
 * @param {EditNodeFormProps} props
 * @returns {JSX.Element}
 */
const EditNodeForm = (props: EditNodeFormProps): JSX.Element => {
  const {
    rotationState: { value: rotationValue, setFn: setRotationValue },
    xPositionState: { value: xPositionValue, setFn: setXPositionValue },
    yPositionState: { value: yPositionValue, setFn: setYPositionValue },
    tileNameState: { value: tileNameValue, setFn: setTileNameValue },
  } = props;

  // Needed since the form values are possible initially undefined.
  // When this happens the comparison between the initial and current values
  // will always be true, causing the form to be marked as changed.
  // Also, the input values are validated to be number 0.
  const validRotationValue: number = getValidNumber(rotationValue);
  const validXPositionValue: number = getValidNumber(xPositionValue);
  const validYPositionValue: number = getValidNumber(yPositionValue);
  // keeps track of whether any of the form values has been changed
  const [hasChanged, setHasChanged] = useState(false);

  const initialValues = useRef<NodeConfiguration>({
    rotation: validRotationValue,
    x_position: validXPositionValue,
    y_position: validYPositionValue,
    tileName: tileNameValue,
  });

  useEffect(() => {
    initialValues.current = {
      rotation: validRotationValue,
      x_position: validXPositionValue,
      y_position: validYPositionValue,
      tileName: tileNameValue,
    };
  }, [props.selectedNode]);

  useEffect(() => {
    // If any of the form values has changed, the hasChanged state will be set to true
    setHasChanged(
      validRotationValue !== initialValues.current.rotation ||
        validXPositionValue !== initialValues.current.x_position ||
        validYPositionValue !== initialValues.current.y_position ||
        tileNameValue !== initialValues.current.tileName,
    );
  }, [
    validRotationValue,
    validXPositionValue,
    validYPositionValue,
    tileNameValue,
  ]);

  // Input configurations for the form. Please note that the label
  // for each must be unique since it is used as the input's id.
  const rotationInputConfig: EditNodeInput = {
    label: "orientation",
    value: validRotationValue,
    setValue: setRotationValue,
    step: ROTATION_STEP,
    symbol: <i className="fa-solid fa-rotate-right"></i>,
    bounds: {
      min: ROTATION_MIN,
      max: ROTATION_MAX,
    },
  };

  const xPositionInputConfig: EditNodeInput = {
    label: "x",
    value: validXPositionValue,
    setValue: setXPositionValue,
    symbol: <i className="fa-solid fa-arrows-left-right"></i>,
    bounds: {
      min: POSITION_MIN,
      max: POSITION_MAX,
    },
  };

  const yPositionInputConfig: EditNodeInput = {
    label: "y",
    value: validYPositionValue,
    setValue: setYPositionValue,
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

  const getInitialParams = (node: NewNode): InitialViewParameters => {
    const tile_id = node.tiles_id;

    const selectedNodeData = props.nodesData.find(
      (node) => node.survey_node.tiles_id === tile_id,
    );
    const initialParams = selectedNodeData?.survey_node.initial_parameters;
    return !initialParams ? { yaw: 0, pitch: 0, fov: 0 } : initialParams;
  };

  const initialRotationOffset: number = props.selectedNode
    ? Math.round(radiansToDegrees(props.selectedNode.rotation ?? 0))
    : 0;

  const yawInDeg: number | null = props.selectedNode
    ? yawRadToDeg(getInitialParams(props.selectedNode)?.yaw)
    : 0;

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e, props.updateNode);
        setHasChanged(false);
      }}
    >
      <span>
        <input
          id="tileName"
          name="tileName"
          type="text"
          value={tileNameValue}
          onChange={(e) => setTileNameValue(e.target.value)}
          className="nodeEditTitle"
        />
      </span>
      <span data-cy="currRotation-offset-value">
        Initial Minimap Rotation Offset: {`${initialRotationOffset}\u00B0`}
        <Icon
          className="fa fa-arrow-up"
          style={{
            opacity: "0.5",
            color: "red",
            marginLeft: "10px",
            width: "20px",
            transform: `rotate(${props.selectedNode ? props.selectedNode.rotation : 0}rad)`,
          }}
        />
      </span>

      <span data-cy="viewParam-currYaw-value">
        Initial Yaw Parameters: {props.selectedNode && `${yawInDeg}\u00B0`}
        <Icon
          className="fa fa-arrow-up"
          style={{
            color: "black",
            marginLeft: "10px",
            width: "20px",
            transform: `rotate(${yawInDeg}deg)`,
          }}
        />
      </span>
      <span>
        <label className="edit-form-label" htmlFor={rotationInputConfig.label}>
          Rotation Offset
        </label>
        <div>
          <EditNodePositionInput
            inputConfiguration={rotationInputConfig}
            handleInputChange={handleInputChange}
          />
        </div>
      </span>

      <span>
        <label className="edit-form-label" htmlFor={xPositionInputConfig.label}>
          Coordinates
        </label>
        <div className="coords-container">
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
        </div>
      </span>

      <span>
        <div className="buttons">
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
          <button
            type="submit"
            data-cy="submit-button"
            disabled={!hasChanged}
            className={!hasChanged ? "disabled" : ""}
          >
            Save
          </button>
        </div>
      </span>
    </form>
  );
};

// Additional helpers:
function radiansToDegrees(radians: number): number {
  const degrees = ((radians + 2 * Math.PI) % (2 * Math.PI)) * (180 / Math.PI);
  return degrees;
}

function yawRadToDeg(radians: number): number {
  return Math.round(((radians * 180) / Math.PI) * 100) / 100;
}

export default EditNodeForm;
