import React, { useEffect, useState } from "react";
import { PinData, EditingFunctions } from "../SiteSelector";
import validator from "validator";
import Modal from "./Modal";
import {
  CheckboxPropsInputInterface,
  ImageDropDownInputInterface,
  ModalTypes,
  PinSelectorInputInterface,
  PinSpecificFunctionsInterface,
} from "./Modal.type";

/**
 * Interface for SitePinModal
 * @param toggleModalView hide or show the site pin modal
 * @param addPin function to add a pin to the database
 * @param newCoords the coordinates from where the user clicks on the map
 * @param setEditState changing the pins functionality
 * @param updatePin function to update an existing pin in the database
 * @param setAddPinInfo toggle the message that appears in the top right corner for adding pins
 * @param sitemapName the name of the map that pins stay on
 * @param pinEditState the current functionality of the pin
 * @param site the pin and its associated info
 */
interface SitePinModalProps {
  toggleModalView: (value: boolean) => void;
  addPin: (newPin: PinData) => void;
  newCoords: { x: number; y: number };
  setEditState: (chosenEdit: EditingFunctions) => void;
  updatePin: (sitePin: PinData) => void;
  setAddPinInfo: (toggleInfo: boolean) => void;
  sitemapName: string;
  pinEditState: EditingFunctions;
  site: PinData;
}
/**
 * Modal for site pin interactions (add a pin / edit a pin)
 * This file handles the core functionality for a site pin (add / edit)
 * The Modal.tsx component is used for rendering the visuals of the modal
 * NOTE: addPin, newCoords are used for adding a pin (which is currently disable since waiting on api endpoint to POST to)
 * @returns a modal for site pins
 */
function SitePinModal({
  toggleModalView,
  addPin,
  newCoords,
  site,
  setEditState,
  updatePin,
  setAddPinInfo,
  sitemapName,
  pinEditState,
}: SitePinModalProps) {
  // Selected icon for the pin
  const [icon, setIcon] = useState<string>("");
  // Pin name
  const [name, setName] = useState<string>("");
  // State for storing the uploaded image URL. Only used in the case of the edit modal.
  const [image, setImage] = useState<string>("");
  // External url
  const [externalUrl, setExternalUrl] = useState<string>("");
  // State for enabling or disabling the URL input
  const [isExternal, setIsExternal] = useState<boolean>(false);
  const ModalImageDropDownProp: ImageDropDownInputInterface = {
    view: true,
    image: image,
    setImage: setImage,
  };
  const ModalPinSelectorProp: PinSelectorInputInterface = {
    view: true,
    icon: icon,
    setIcon: setIcon,
  };
  const ModalPinProp: PinSpecificFunctionsInterface = {
    setEditState: setEditState,
    setAddPinInfo: setAddPinInfo,
    pinEditState: pinEditState,
  };

  useEffect(() => {
    setName(site.name);
    setIcon(site.icon);
    setImage(site?.cover_image);

    if (site?.external_url) {
      setExternalUrl(site.external_url);
      setIsExternal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * This function checks for invalid parameters in the site pin modal form
   * Missing param logic:
   * Single Param (name, icon, external URL): "Error missing a name/icon/url"
   * Single Param with validation: "Error missing a valid url"
   * Two Param (name + icon, name + external URL, icon + external URL): "Error missing a name/icon/url and name/icon/url"
   * Two Param with validation (name + invalid URL, icon + invalud URL): "Error missing a name/icon and valid url"
   * All Params: "Error missing a name and icon and url"
   */
  function validateForm() {
    const nameMsg = name === "" ? "- A name \n" : "";
    const iconMsg = ModalPinSelectorProp.icon === "" ? "- An Icon \n" : "";
    const externalMsg = isExternal
      ? !validator.isURL(externalUrl)
        ? "- A Valid URL \n"
        : "- An External URL \n"
      : "";
    return nameMsg + iconMsg + externalMsg;
  }

  /**
   * This function handles the submission button actions from the modal
   * It will call the validateform() function to ensure the form is correct prior to submission
   * If validation is successful then run toggle the modal closed (setHideState())
   * and set the pin edit mode to default (setSelect(edit.default))
   */
  function handleSubmit() {
    //validate the url
    if (
      (icon && name && isExternal && validator.isURL(externalUrl)) ||
      (icon && name && !isExternal)
    ) {
      setEditState(EditingFunctions.DEFAULT);
      if (site._id === "") {
        addPin({
          _id: "",
          site: "",
          name: name,
          x: newCoords.x,
          y: newCoords.y,
          icon: icon,
          cover_image: image,
          enabled: false,
          external_url: isExternal ? externalUrl : undefined,
          sitemap: sitemapName,
        });
      } else {
        updatePin({
          ...site,
          name: name,
          icon: icon,
          cover_image: image,
          external_url: isExternal ? externalUrl : undefined,
        });
      }
      // toggle edit panel add site button back to default
      setEditState(EditingFunctions.DEFAULT);
      setAddPinInfo(false);
      toggleModalView(false);
    } else {
      return window.alert("You are missing the following: \n" + validateForm());
    }
  }
  const checkboxInputProps: CheckboxPropsInputInterface = {
    setCheckboxValue: setIsExternal,
    checkboxValue: isExternal,
  };
  return (
    <Modal
      title={pinEditState === EditingFunctions.CHANGE ? "editPin" : "addPin"}
      toggleModal={toggleModalView}
      showImageDragDrop={ModalImageDropDownProp}
      showPinIconSelector={ModalPinSelectorProp}
      type={
        pinEditState === EditingFunctions.CHANGE
          ? ModalTypes.edit
          : ModalTypes.create
      }
      pinFunctions={ModalPinProp}
      handleSubmit={handleSubmit}
      inputs={[
        {
          label:
            pinEditState === EditingFunctions.CHANGE
              ? "editSiteName"
              : "addSiteName",
          setValue: setName,
          value: name,
          placeholder: "Enter site pin name",
          hasCheckbox: false,
        },
        {
          label: externalUrl ? "editExternalURL" : "addExternalURL",
          setValue: setExternalUrl,
          value: externalUrl,
          placeholder: "Enter a URL Link",
          hasCheckbox: true,
          checkboxProps: checkboxInputProps,
        },
      ]}
    />
  );
}

export default SitePinModal;
