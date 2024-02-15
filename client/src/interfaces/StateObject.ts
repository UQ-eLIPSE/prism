/**
 * Interface for a state object with a value and a set function.
 * Helpful for creating state objects in React.
 *
 * @interface StateObject
 * @template T - The type of the value.
 * @property {T} value - The value of the state object.
 * @property {React.Dispatch<React.SetStateAction<T>>} setFn - The set function for the state object.
 */
export interface StateObject<T> {
  value: T;
  setFn: React.Dispatch<React.SetStateAction<T>>;
}
