import { EditingFunctions } from "../SiteSelector";

/**
 * The possible cases for what a modal type can do
 * Currently used to help infer meaning of the modals purpose and
 * rendering correct message for the submit button
 *
 */
export enum ModalTypes {
  edit,
  create,
}

export interface ImageDropDownInputInterface {
  view: boolean;
  image: string;
  setImage: (value: string) => void;
}

export interface PinSelectorInputInterface {
  view: boolean;
  icon?: string;
  setIcon?: (value: string) => void;
}
/**
 * This interface is for text input forms
 * @param label the subheading for the input form
 * @param setValue useState hook for setting a string variable
 * @param value string variable to the setValue hook
 * @param placeholder placeholder text for the input form
 * @param hasCheckbox boolean show a checkbox on the input form
 * @param setCheckboxValue toggling the boolean value for a checkbox
 * @param checkboxValue current value for a checkbox
 */
export interface InputInterface {
  label: string;
  setValue: (value: string) => void;
  value: string;
  placeholder: string;
  hasCheckbox: boolean;
  checkboxProps?: CheckboxPropsInputInterface;
}

/**
 * This interface is used to pass down the checkbox props from the parent to the grandchild component (CheckboxInput.tsx)
 */
export interface CheckboxPropsInputInterface {
  setCheckboxValue: (value: boolean) => void;
  checkboxValue: boolean;
}
/**
 * Interface for specifying Pin modal specific functions
 * @param setEditState changing the pin functionality
 * @param setAddPinInfo toggleing the add pin message on the top right of screen
 * @param pinEditState get the current pin functionality
 */
export interface PinSpecificFunctionsInterface {
  setEditState: (value: EditingFunctions) => void;
  setAddPinInfo: (value: boolean) => void;
  pinEditState: EditingFunctions;
}

/**
 * Interface for a modal component
 * @param title the title of a modal
 * @param toggleModal show/close a modal
 * @param inputs the modal form inputs (see InputInterface)
 * @param showImageDragDrop components for rendering an image drag drop section
 * @param showPinIconSelector components for rendering a pin icon selector section
 * @param type the type of modal functionality
 * @param pinFunctions components for pin specific functionality
 * @param handleSubmit function for when users click the create/save button
 */
export interface ModalInterface {
  title: string;
  toggleModal: (value: boolean) => void;
  inputs: InputInterface[];
  showImageDragDrop: ImageDropDownInputInterface;
  showPinIconSelector: PinSelectorInputInterface;
  type: ModalTypes;
  pinFunctions?: PinSpecificFunctionsInterface;
  handleSubmit: () => void;
}
