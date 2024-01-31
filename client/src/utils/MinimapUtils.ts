import { MinimapReturn } from "../components/Site";
import { NewNode } from "../interfaces/MiniMap/NewNode";

/**
 * Constants related to the Minimap.
 */
export enum MinimapConstants {
  /**
   * The percentage value in respect to the x and y coordinates of the node.
   */
  PERCENTAGE = 100,

  /**
   * The degree value in respect to the rotation of the node.
   */
  DEGREE = 360,

  /**
   * Signifies the conversion factor from radians to degrees.
   */
  DEGREES_TO_RADIANS = 57.2958,
}

interface newScaledCoordinates {
  newNodeXScaledCoordinate: number;
  newNodeYScaledCoordinate: number;
}

/**
 * Calculates a scaled position for the node as a percentage.
 * @param nodeCoordinate1 Either the x coordinate or the y coordinate of the node
 * @param nodeCoordinate2 Either the x coordinate or the y coordinate of the node
 * @param flipped Boolean value to check if the node is flipped
 * @param offset offset value for the node
 * @param scale a scale value for the node
 * @param imageHeightorWidth Either the image height or the width
 * @returns the node position on the map
 */
function calculateXY(
  nodeCoordinate1: number,
  nodeCoordinate2: number,
  flipped: boolean,
  offset: number,
  scale: number,
  imageHeightorWidth: number,
): number {
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
    Math.round(degrees * MinimapConstants.DEGREES_TO_RADIANS) %
    MinimapConstants.DEGREE
  );
}

/**
 * Helper function to obtain the new x and y scaled coordinates based on the minimapData and a newNode.
 * @param {MinimapReturn} minimapData Data configuration from the minimap.
 * @param {NewNode} node The new node to be selected
 * @returns {object} The new x and y scaled coordinates.
 */
const getScaledNodeCoordinates = (
  minimapData: MinimapReturn,
  node: NewNode,
): newScaledCoordinates => {
  const {
    xy_flipped,
    x_pixel_offset,
    x_scale,
    img_width,
    y_pixel_offset,
    y_scale,
    img_height,
  } = minimapData;

  const newNodeXScaledCoordinate = calculateXY(
    node.x,
    node.y,
    xy_flipped,
    x_pixel_offset,
    x_scale,
    img_width,
  );

  const newNodeYScaledCoordinate = calculateXY(
    node.y,
    node.x,
    xy_flipped,
    y_pixel_offset,
    y_scale,
    img_height,
  );

  return { newNodeXScaledCoordinate, newNodeYScaledCoordinate };
};

/**
 * Sets the selected node based on the editing mode and current selected node.
 * @param editing Boolean value indicating if the editing mode is active
 * @param currentSelectedNode Currently selected node
 * @param newNode New node to be selected
 * @param minimapData Data configuration from the minimap
 * @param handleSetSelectedNode Function to handle setting the selected node
 * @param handleSetXCoordinate Handle setting the x coordinate
 * @param handleSetYCoordinate Handle setting the y coordinate
 * @param handleSetRotation Handle setting the rotation
 * @param updateMiniMapEnlarged To handle updating the minimap enlargement status
 * @param handleMinimapOnClickNode Handle clicking on a node in the minimap
 */
const setNodeSelected = (
  editing: boolean,
  currentSelectedNode: NewNode | null,
  newNode: NewNode,
  minimapData: MinimapReturn,
  handleSetSelectedNode: (value: React.SetStateAction<NewNode | null>) => void,
  handleSetXCoordinate: (value: React.SetStateAction<number>) => void,
  handleSetYCoordinate: (value: React.SetStateAction<number>) => void,
  handleSetRotation: (value: React.SetStateAction<number>) => void,
  updateMiniMapEnlarged: (minimapEnlarged: boolean) => void,
  handleMinimapOnClickNode: (panoId: string) => void,
) => {
  if (editing && !currentSelectedNode) {
    handleSetSelectedNode(newNode);

    const { newNodeXScaledCoordinate, newNodeYScaledCoordinate } =
      getScaledNodeCoordinates(minimapData, newNode);

    // Set new selected node to have the new scaled coordinates calculated above.
    handleSetXCoordinate(newNodeXScaledCoordinate);
    handleSetYCoordinate(newNodeYScaledCoordinate);

    handleSetRotation(convertDegreesToRadians(newNode.rotation));
  } else if (!editing && !currentSelectedNode) {
    updateMiniMapEnlarged(false);
    handleMinimapOnClickNode(newNode.tiles_id);
  }
};

export default { setNodeSelected };
