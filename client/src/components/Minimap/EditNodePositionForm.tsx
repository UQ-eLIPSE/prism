/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { EditNodeInput } from "../../interfaces/MiniMap/EditNodeInput";
import EditNodePositionInput from "./EditNodePositionInput";
import { StateObject } from "../../interfaces/StateObject";
import { NewNode } from "../../interfaces/MiniMap/NewNode";
import { InitialViewParameters, NodeData } from "../../interfaces/NodeData";
import { Icon } from "@material-ui/core";

// * To be changed to use a Position type in future refactor.
interface EditNodeFormProps {
  rotationState: StateObject<number>;
  xPositionState: StateObject<number>;
  yPositionState: StateObject<number>;
  resetSelectedNode: () => void; // Clears selected node and sets editing to false.
  updateNode: () => Promise<void>;
  selectedNode: NewNode | null;
  nodesData: NodeData[];
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
  const {
    rotationState: { value: rotationValue, setFn: setRotationValue },
    xPositionState: { value: xPositionValue, setFn: setXPositionValue },
    yPositionState: { value: yPositionValue, setFn: setYPositionValue },
  } = props;
  // keeps track of whether any of the form values has been changed
  const [isChanged, setIsChanged] = useState(false);

  console.log("selected node: ", props.selectedNode);

  const initialValues = useRef({
    rotation: rotationValue,
    xPosition: xPositionValue,
    yPosition: yPositionValue,
  });

  console.log("initial values", initialValues);
  console.log("current values", rotationValue, xPositionValue, yPositionValue);

  useEffect(() => {
    initialValues.current = {
      rotation: rotationValue,
      xPosition: xPositionValue,
      yPosition: yPositionValue,
    };
  }, [props.selectedNode]);

  useEffect(() => {
    if (
      rotationValue !== initialValues.current.rotation ||
      xPositionValue !== initialValues.current.xPosition ||
      yPositionValue !== initialValues.current.yPosition
    ) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [rotationValue, xPositionValue, yPositionValue]);

  // Input configurations for the form. Please note that the label
  // for each must be unique since it is used as the input's id.
  const rotationInputConfig: EditNodeInput = {
    label: "orientation",
    value: rotationValue,
    setValue: setRotationValue,
    step: 15,
    symbol: <i className="fa-solid fa-rotate-right"></i>,
    bounds: {
      min: ROTATION_MIN,
      max: ROTATION_MAX,
    },
  };

  const xPositionInputConfig: EditNodeInput = {
    label: "x",
    value: xPositionValue,
    setValue: setXPositionValue,
    symbol: <i className="fa-solid fa-arrows-left-right"></i>,
    bounds: {
      min: POSITION_MIN,
      max: POSITION_MAX,
    },
  };

  const yPositionInputConfig: EditNodeInput = {
    label: "y",
    value: yPositionValue,
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
    <form onSubmit={(e) => handleSubmit(e, props.updateNode)}>
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
          <button type="submit" data-cy="submit-button" hidden={!isChanged}>
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
