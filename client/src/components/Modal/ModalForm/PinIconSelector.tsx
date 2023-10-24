import React from "react";
import { PinSelectorInputInterface } from "../Modal.type";

interface PinIconSelectorInterface {
  toggleIconView: (value: boolean) => void;
  toggleImageView: (value: boolean) => void;
  showPinIconSelector: PinSelectorInputInterface;
}
/**
 * Function that renders the pin options that a user can select from (parent is Modal.tsx)
 * @param setIcon is a setState function from the Modal file
 * @returns a JSX element
 */
function PinIconSelector(props: PinIconSelectorInterface): JSX.Element {
  const { toggleIconView, toggleImageView, showPinIconSelector } = props;
  /**
   * Icons avaliable to select from
   */
  const iconClasses: { [key: string]: string } = {
    learn: "fa-solid fa-graduation-cap",
    shop: "fa-solid fa-shopping-cart",
    farm: "fa-solid fa-leaf",
    pig: "fa-solid fa-piggy-bank",
    animal: "fa-solid fa-cow",
    truck: "fa-solid fa-truck-fast",
  };

  return (
    <div className="modal-icon">
      {Object.entries(iconClasses).map(([key, value]) => {
        return (
          <button
            className={`icon-button-container ${
              showPinIconSelector.icon && showPinIconSelector.icon === key
                ? "selected"
                : ""
            }`}
            key={key}
            onClick={() => {
              showPinIconSelector.setIcon && showPinIconSelector.setIcon(key);
              toggleIconView(false);
              toggleImageView(true);
            }}
          >
            <i className={`select-icon ${value}`}></i>
          </button>
        );
      })}
    </div>
  );
}

export default PinIconSelector;
