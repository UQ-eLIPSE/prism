// The Minimap's boundaries
const maxMapBoundary: number = 100;
const minMapBoundary: number = 0;

// Don't want to render the node on the edge of the minimap.
// This value will help offset the rendering placement of the node.
const nodeOffset: number = 5;

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
  DEGREES_TO_RADIANS_ROTATION = 57.2958,

  /**
   * Represents the upper limit for the node to be placed in the map.
   */
  UPPER_BOUND = maxMapBoundary,

  /**
   * Represents the lower limit for the node to be placed in the map.
   */
  LOWER_BOUND = minMapBoundary,

  /**
   * Adjusts the node's position when it reaches the upper limit to this value.
   */
  UPPER_ADJUST = maxMapBoundary - nodeOffset,

  /**
   * Adjusts the node's position when it reaches the lower limit to this value.
   */
  LOWER_ADJUST = minMapBoundary + nodeOffset,

  /**
   * Represent the offset to correct render radar view around mininodes
   */
  OFFSET = -0.785398,
}
