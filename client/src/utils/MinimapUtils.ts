import { MinimapReturn } from "../components/Site";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import NetworkCalls from "./NetworkCalls";
import { xAndYScaledCoordinates } from "../interfaces/MiniMap/XAndYScaledCoordinates";
import { FloorIdentifier } from "../interfaces/MiniMap/FloorIdentifier";
import { MinimapConstants } from "./MinimapConstants.d";

/**
 * Interface for parameters needed to calculate X and Y coordinates for a minimap.
 *
 * @interface
 * @property {number} nodeCoordinate1 - The first node coordinate.
 * @property {number} nodeCoordinate2 - The second node coordinate.
 * @property {boolean} flipped - Indicates whether the coordinates are flipped.
 * @property {number} offset - The offset to be applied to the coordinates.
 * @property {number} scale - The scale factor for the minimap.
 * @property {number} imageHeightorWidth - The height or width of the image, depending on whether X or Y is being calculated.
 */
interface CalculateXYConfigParams {
  nodeCoordinate1: number;
  nodeCoordinate2: number;
  flipped: boolean;
  offset: number;
  scale: number;
  imageHeightorWidth: number;
}

/**
 * Calculates a scaled position for the node as a percentage.
 *
 * @param {CalculateXYConfigParams} calculateXYConfig - The parameters needed to calculate the X or Y coordinate.
 * @returns {number} the node position on the map
 */
function calculateXY(calculateXYConfig: CalculateXYConfigParams): number {
  const {
    nodeCoordinate1,
    nodeCoordinate2,
    flipped,
    offset,
    scale,
    imageHeightorWidth,
  } = calculateXYConfig;
  return (
    (scale *
      ((!flipped ? nodeCoordinate1 : nodeCoordinate2) + offset) *
      MinimapConstants.PERCENTAGE) /
    imageHeightorWidth
  );
}

/**
 * Helper function to convert degrees to radians.
 * @param {number} degrees Degrees from 0 to 360
 * @returns {number} Converted radians value.
 */
function convertDegreesToRadians(degrees: number): number {
  return (
    Math.round(degrees * MinimapConstants.DEGREES_TO_RADIANS_ROTATION) %
    MinimapConstants.DEGREE
  );
}

/**
 * Helper function to obtain the new x and y scaled coordinates based on
 *  the minimapData and a newNode.
 *
 * Basically utilises calculateXY applied on both x and y to calculate the
 *  new scaled coordinates.
 * @param {MinimapReturn} minimapData Data configuration from the minimap.
 * @param {NewNode} node The node for its coordinates to be scaled.
 * @returns {xAndYScaledCoordinates} The new x and y scaled coordinates.
 */
const getScaledNodeCoordinates = (
  minimapData: MinimapReturn,
  node: NewNode,
): xAndYScaledCoordinates => {
  const {
    xy_flipped,
    x_pixel_offset,
    x_scale,
    img_width,
    y_pixel_offset,
    y_scale,
    img_height,
  } = minimapData;

  const nodeXScaledCoordinate = calculateXY({
    nodeCoordinate1: node.x,
    nodeCoordinate2: node.y,
    flipped: xy_flipped,
    offset: x_pixel_offset,
    scale: x_scale,
    imageHeightorWidth: img_width,
  });

  const nodeYScaledCoordinate = calculateXY({
    nodeCoordinate1: node.y,
    nodeCoordinate2: node.x,
    flipped: xy_flipped,
    offset: y_pixel_offset,
    scale: y_scale,
    imageHeightorWidth: img_height,
  });

  return { nodeXScaledCoordinate, nodeYScaledCoordinate };
};

/**
 * Sets the selected node based on the editing mode and current selected node.
 * @param newNode New node to be selected
 * @param minimapData Data configuration from the minimap
 * @param handleSetSelectedNode Function to handle setting the selected node state
 * @param handleSetXCoordinate Handle setting the x coordinate state
 * @param handleSetYCoordinate Handle setting the y coordinate state
 * @param handleSetRotation Handle setting the rotation state
 */
const setNodeSelected = (
  newNode: NewNode,
  minimapData: MinimapReturn,
  handleSetSelectedNode: (value: React.SetStateAction<NewNode | null>) => void,
  handleSetXCoordinate: (value: React.SetStateAction<number>) => void,
  handleSetYCoordinate: (value: React.SetStateAction<number>) => void,
  handleSetRotation: (value: React.SetStateAction<number>) => void,
): void => {
  handleSetSelectedNode(newNode);

  const { nodeXScaledCoordinate, nodeYScaledCoordinate } =
    getScaledNodeCoordinates(minimapData, newNode);

  // Set new selected node to have the new scaled coordinates calculated above.
  handleSetXCoordinate(nodeXScaledCoordinate);
  handleSetYCoordinate(nodeYScaledCoordinate);

  const rotationInRadians = convertDegreesToRadians(newNode.rotation);
  handleSetRotation(rotationInRadians);
};

/**
 * Updating the information of the node after pressing save
 * @param imageHeightorWidth Either the image height or width
 * @param coordinate Either the x or the y coordinate
 * @param offset the offset of the node
 * @param scale the scale value of the node
 * @returns the saved coordinate of the node
 */
function calculateNewXY(
  imageHeightorWidth: number,
  coordinate: number,
  offset: number,
  scale: number,
): number {
  return ((imageHeightorWidth * coordinate) / 100 - offset) / scale;
}

/**
 * Updates the node's coordinates in the database.
 * The newX and newY coordinate is calculated using the MinimapUtils.calculateNewXY() function.
 *
 * @param selectedNode The current selected node
 * @param newX The new x coordinate
 * @param newY The new y coordinate
 * @param windowAlertMessage Will be displayed if the API call fails
 * @returns {Promise<void>}
 */
const updateNodeCoordinateAPI = async (
  selectedNode: NewNode | null,
  newX: number,
  newY: number,
  windowAlertMessage: string,
): Promise<void> => {
  try {
    await NetworkCalls.updateNodeCoordinates(
      // Converts x and y percentage coordinates to pixel coordinates in
      // relation to image height and width.
      // I.e., x = 50 means 50% from left, therefore, 50% of image width since 50 / 100 = 0.5.

      selectedNode?.survey_node,
      newX,
      newY,
    );
  } catch (error) {
    window.alert(`${windowAlertMessage}: ${error}`);
  }
};

/**
 * Updates the node's rotation in the database.
 * @param selectedNode The current selected node
 * @param newRotation The new rotation value in degrees
 * @param windowAlertMessage Will be displayed if the API call fails
 * @returns {Promise<void>}
 */
const updateNodeRotationAPI = async (
  selectedNode: NewNode | null,
  newRotation: number,
  windowAlertMessage: string,
): Promise<void> => {
  try {
    // Dividing rotation by 57.2958 will convert it from degrees (0 - 360) to radians to be stored in the db.
    await NetworkCalls.updateNodeRotation(
      selectedNode?.survey_node,
      newRotation / MinimapConstants.DEGREES_TO_RADIANS_ROTATION, //api takes in radians
    );
  } catch (error) {
    window.alert(`${windowAlertMessage}: ${error}`);
  }
};

/**
 * Updates the floor's tag and name in the database.
 * @param floorId Specified floor id
 * @param siteId Specified site id
 * @param floorInfo Floor's tag and name
 * @param windowAlertMessage Will be displayed if the API call fails
 * @returns {Promise<boolean>} True if the API call is successful, false otherwise.
 */
const updateFloorTagAndNameAPI = async (
  floorId: number,
  siteId: string,
  floorInfo: FloorIdentifier,
  windowAlertMessage: string,
): Promise<boolean> => {
  const { floorTag, floorName } = floorInfo;

  try {
    const call = await NetworkCalls.updateMinimapNames(
      floorId,
      siteId,
      floorTag,
      floorName,
    );

    return call.success === true;
  } catch (error) {
    window.alert(`${windowAlertMessage}: ${error}`);
    return false;
  }
};

export default {
  getScaledNodeCoordinates,
  setNodeSelected,
  calculateNewXY,
  updateNodeCoordinateAPI,
  updateNodeRotationAPI,
  updateFloorTagAndNameAPI,
};
