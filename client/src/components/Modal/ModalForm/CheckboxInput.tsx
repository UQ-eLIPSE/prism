import React from "react";

/**
 * This interface is for the checkbox input form
 *
 * @param setCheckboxValue toggle the checkbox
 * @param checkboxValue the current checkbox value
 * @param setValue change the text input
 * @param value the text input
 * @param placeholder placeholder text in the text input
 */
interface CheckboxInputInterface {
  setCheckboxValue: (value: boolean) => void;
  checkboxValue: boolean;
  setValue: (value: string) => void;
  value: string;
  placeholder: string;
}

export default function CheckboxInput(props: CheckboxInputInterface) {
  const { setCheckboxValue, checkboxValue, setValue, value, placeholder } =
    props;
  return (
    <div className="input-container">
      <input
        type="checkbox"
        onClick={() => {
          setCheckboxValue(!checkboxValue);
        }}
        checked={checkboxValue}
        className="input-checkbox"
        onChange={() => {}}
      />
      <input
        className={`${!checkboxValue && "input-form checkbox-form"}`}
        type="text"
        id="input-section"
        placeholder={placeholder}
        value={value}
        onClick={() => {
          setCheckboxValue(true);
        }}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.currentTarget.value);
        }}
      />
    </div>
  );
}
