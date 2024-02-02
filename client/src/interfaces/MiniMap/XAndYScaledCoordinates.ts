/**
 * Interface for basic node coordinates but scaled based on the
 *  minimap_image_x_scale and y_scale.
 * @property {number} nodeXScaledCoordinate The scaled x coordinate
 * @property {number} nodeYScaledCoordinate The scaled y coordinate
 */
export interface xAndYScaledCoordinates {
  nodeXScaledCoordinate: number;
  nodeYScaledCoordinate: number;
}
