import { ReactNode } from "react";

/**
 * An interface to represent each input field in the EditNode component.
 * The specific input type should be a number.
 * Used under ./src/components/EditNodeForm.tsx
 * @interface EditNodeInput
 * @property {string} label - The id and name of the input field.
 * @property {number} value - The value of the input field.
 * @property {function} setValue - A function to set the value of the input field.
 * @property {object} bounds - The min and max bounds of the input field.
 * @property {number} step - The step of the input field.
 * @property {ReactNode} symbol - The symbol of the input field.
 */
export interface EditNodeInput {
  label: string;
  value: number;
  setValue: (value: number) => void;
  bounds: {
    min: number;
    max: number;
  };
  step?: number;
  symbol?: ReactNode;
}
