import React, { useState } from "react";
import { useIntl } from "react-intl";
import ImageDragDrop from "./ModalForm/ImageDragDrop";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import PinIconSelector from "./ModalForm/PinIconSelector";
import { EditingFunctions } from "../SiteSelector";
import { ModalInterface, ModalTypes } from "./Modal.type";
import CheckboxInput from "./ModalForm/CheckboxInput";

/**
 * This is a abstract modal component that can be used to do the following:
 * - Image drag and drop
 * - External URL form input (with optional checkbox)
 * - Text input
 * - Pin Icon Selector
 * @param props ModalInterface
 * @returns a generic modal component
 */
function Modal(props: ModalInterface) {
  const {
    title,
    toggleModal,
    inputs,
    showImageDragDrop,
    showPinIconSelector,
    type,
    pinFunctions,
    handleSubmit,
  } = props;
  const messages = useIntl();
  const [iconSelectorWindow, setIconSelectorWindow] = useState<boolean>(false);
  const [imageDragDrop, setImageDragDrop] = useState<boolean>(
    showImageDragDrop.view ? true : false,
  );
  const theme = createTheme({
    palette: {
      primary: {
        main: "#e8754b",
        contrastText: "#ffff",
      },

      secondary: {
        main: "#6a260e",
        contrastText: "#6a260e",
      },
    },
  });

  /**
   * Icons avaliable to select from
   */
  const iconClasses: { [key: string]: string } = {
    learn: "fa-solid fa-graduation-cap",
    shop: "fa-solid fa-shopping-cart",
    farm: "fa-solid fa-leaf",
    animal: "fa-solid fa-cow",
    pig: "fa-solid fa-piggy-bank",
    truck: "fa-solid fa-truck-fast",
    default: "fa-solid fa-plus",
  };

  return (
    <div
      className="container"
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="modal">
        <div>
          <div className="modal-title">
            <span className="edit-title">
              {messages.formatMessage({ id: title })}
            </span>
            <i
              id="modal-close"
              className="fas fa-x"
              onClick={() => {
                toggleModal(false);
                if (pinFunctions) {
                  pinFunctions.setEditState(EditingFunctions.DEFAULT);
                  pinFunctions.setAddPinInfo(false);
                }
              }}
            />
          </div>
          {imageDragDrop && !iconSelectorWindow && (
            <ImageDragDrop
              image={showImageDragDrop.image}
              setImage={showImageDragDrop.setImage}
            />
          )}
          {iconSelectorWindow && !imageDragDrop && showPinIconSelector && (
            <PinIconSelector
              showPinIconSelector={showPinIconSelector}
              toggleIconView={setIconSelectorWindow}
              toggleImageView={setImageDragDrop}
            />
          )}
          <div className="module-bottom">
            <div className="module-form input-form input-section" id="sitemap">
              {inputs.map((item, index) => {
                return (
                  <div key={index}>
                    <label className="module-bottom-subtitle">
                      {messages.formatMessage({
                        id: item.label,
                      })}
                    </label>
                    <div className="input-container">
                      {item.hasCheckbox && item.checkboxProps && (
                        <CheckboxInput
                          setCheckboxValue={item.checkboxProps.setCheckboxValue}
                          checkboxValue={item.checkboxProps.checkboxValue}
                          setValue={item.setValue}
                          value={item.value}
                          placeholder={item.placeholder}
                        />
                      )}
                      {/* this is a text input */}
                      {!item.hasCheckbox && (
                        <input
                          className={`${"input-form"}`}
                          id="input-section"
                          type="text"
                          placeholder={item.placeholder}
                          value={item.value}
                          onChange={(e) => {
                            e.preventDefault();
                            item.setValue(e.currentTarget.value);
                          }}
                        />
                      )}
                      {showPinIconSelector.view && index === 0 && (
                        <div className="add-icon-button">
                          <ThemeProvider theme={theme}>
                            <Button
                              color="secondary"
                              onClick={() => {
                                setIconSelectorWindow(!iconSelectorWindow);
                                setImageDragDrop(!imageDragDrop);
                              }}
                            >
                              <i
                                className={
                                  showPinIconSelector.icon !== "" &&
                                  showPinIconSelector.icon
                                    ? iconClasses[showPinIconSelector.icon]
                                    : iconClasses["default"]
                                }
                                id={
                                  showPinIconSelector.icon !== ""
                                    ? "select-icon"
                                    : "selected-icon"
                                }
                              />

                              <span className="select-icon-text">
                                {messages.formatMessage({
                                  id: iconSelectorWindow
                                    ? "cancel"
                                    : "selectIcon",
                                })}
                              </span>
                            </Button>
                          </ThemeProvider>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="create-pin-button">
          <ThemeProvider theme={theme}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                handleSubmit();
              }}
            >
              {type && ModalTypes.create
                ? messages.formatMessage({ id: "createItem" })
                : messages.formatMessage({ id: "editItem" })}
            </Button>
          </ThemeProvider>
        </div>
      </div>
      <div
        className="closeModal"
        onClick={() => {
          toggleModal(false);
          if (pinFunctions) {
            pinFunctions.setEditState(EditingFunctions.DEFAULT);
            pinFunctions.setAddPinInfo(false);
          }
        }}
      />
    </div>
  );
}

export default Modal;
