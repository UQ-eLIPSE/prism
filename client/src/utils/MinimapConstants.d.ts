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
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  UPPER_BOUND = 100,

  /**
   * Represents the lower limit for the node to be placed in the map.
   */
  LOWER_BOUND = 0,

  /**
   * Adjusts the node's position when it reaches the upper limit to this value.
   */
  UPPER_ADJUST = 95,

  /**
   * Adjusts the node's position when it reaches the lower limit to this value.
   */
  LOWER_ADJUST = 5,
}
