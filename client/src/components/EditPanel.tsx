import React from "react";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import CancelLocationIcon from "@mui/icons-material/WrongLocation";
import WrongLocationIcon from "@mui/icons-material/WrongLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import DoneIcon from "@mui/icons-material/Done";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PinData, EditingFunctions } from "./SiteSelector";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import Dotenv, { IConfiguration } from "../utils/Dotenv";
import AddSitemapButton from "./AddSitemapButton";

/**
 * Interface for all prop parmeters coming into EditPanel
 */
interface EditPanelProps {
  selectedSite: PinData;
  toggleMove: () => void;
  toggleAdd: () => void;
  deletePin: (site: PinData) => void;
  hidePin: (site: PinData) => void;
  setEditState: (chosenEdit: EditingFunctions) => void;
  editState: string;
  save: boolean;
  setSave: (toggleSave: boolean) => void;
  setUpdatePinStates: (site: PinData) => void;
  setAddPinInfo: (toggleInfo: boolean) => void;
  updateSiteCoords: (site: PinData) => void;
  addPinInfo: boolean;
  setSitemapModal: (value: boolean) => void;
  onClick: () => void;
}

/**
 * Renders the side editing panel for manipulating site pins on the map
 * Also has an add sitemap button on the side
 * @param selectedSite chosen pin
 * @param toggleMove trigger function in parent file to move pin
 * @param toggleAdd trigger function in parent file to add pin
 * @param deletePin trigger function in parent file to delete pin
 * @param hidePin trigger function in parent file to hide pin
 * @param editState which editing button has been selected
 * @param setEditState set the current state of which editing button is selected
 * @param setSave toggle the save button (when the move button is selected or not)
 * @param save boolean to check whether or not to change the move button to show save instead
 * @param updateSiteCoords function to call API and update site coords
 * @param setSitemapModal toggles the add site map modal
 * @returns JSX element
 */
const EditPanel: React.FC<EditPanelProps> = ({
  selectedSite,
  toggleMove,
  toggleAdd,
  deletePin,
  hidePin,
  editState,
  setEditState,
  setSave,
  save,
  setUpdatePinStates,
  setAddPinInfo,
  updateSiteCoords,
  addPinInfo,
  setSitemapModal,
  onClick,
}) => {
  const navigate = useNavigate();
  const messages = useIntl();
  const configSetting = Dotenv;

  /**
   * This function checks if a site scenes already exist, if so then they are shown the scenes instead of an
   * upload scenes page
   * @param siteId the site id
   * @param config the file for whatever the base url is
   */
  const checkScenesExists = async (siteId: string, config: IConfiguration) => {
    try {
      const siteData = await fetch(
        `${window._env_? window._env_.API_URL : config.BASE_URL}/api/site/${siteId}/exists`,
        {
          method: "GET",
        },
      );
      if (!siteData) throw new Error(siteData);
      navigate(`/site/${siteId}/site`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="edit-panel">
        {selectedSite._id === "" && (
          <>
            <button
              onClick={() => {
                if (!addPinInfo) {
                  setEditState(EditingFunctions.ADD);
                  toggleAdd();
                } else {
                  setEditState(EditingFunctions.DEFAULT);
                }
                setAddPinInfo(!addPinInfo);
              }}
            >
              {!addPinInfo ? (
                <>
                  <AddLocationIcon />
                  <p>
                    <FormattedMessage id="addSite" />
                  </p>
                </>
              ) : (
                <>
                  <CancelLocationIcon />
                  <p>Cancel</p>
                </>
              )}
            </button>
            <AddSitemapButton
              setSitemapModal={setSitemapModal}
              disable={addPinInfo}
            />
          </>
        )}

        {selectedSite._id !== "" && (
          <div className="full-edit-panel">
            {save && editState !== "" ? (
              <button
                className={
                  editState === EditingFunctions.MOVE ? "selected" : ""
                }
                onClick={() => {
                  updateSiteCoords(selectedSite);
                  setEditState(EditingFunctions.DEFAULT);
                  setSave(false);
                }}
              >
                <DoneIcon />
                <p>
                  <FormattedMessage id="save" />
                </p>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditState(EditingFunctions.MOVE);
                  toggleMove();
                  setSave(true);
                }}
              >
                <OpenWithIcon />
                <p>
                  <FormattedMessage id="moveSite" />
                </p>
              </button>
            )}

            <button
              onClick={() => {
                setEditState(EditingFunctions.REDIRECT);
                if (selectedSite.external_url?.includes("https://")) {
                  window.open(selectedSite.external_url, "_blank")?.focus();
                }
                if (selectedSite.external_url?.includes("www")) {
                  window
                    .open("//" + selectedSite.external_url, "_blank")
                    ?.focus();
                }
                //check if the the site is already populated with scenes
                !selectedSite.external_url &&
                  checkScenesExists(selectedSite.site, configSetting);
              }}
            >
              <LocationOnIcon />
              <p>
                <FormattedMessage id="goToSite" />
              </p>
            </button>

            <button
              className={
                editState === EditingFunctions.CHANGE ? "selected" : ""
              }
              onClick={() => {
                setEditState(EditingFunctions.CHANGE);
                setUpdatePinStates(selectedSite);
              }}
            >
              <EditLocationAltIcon />
              <p>
                <FormattedMessage id="editSite" />
              </p>
            </button>

            <button
              onClick={() => {
                setEditState(EditingFunctions.DELETE);
                deletePin(selectedSite);
              }}
            >
              <WrongLocationIcon />
              <p>
                <FormattedMessage id="deleteSite" />
              </p>
            </button>

            <button
              onClick={() => {
                hidePin(selectedSite);
              }}
            >
              {selectedSite.enabled ? (
                <VisibilityOffIcon />
              ) : (
                <VisibilityIcon />
              )}

              <p>
                {selectedSite.enabled
                  ? messages.formatMessage({ id: "hideSite" })
                  : messages.formatMessage({
                      id: "showSite",
                    })}
              </p>
            </button>
          </div>
        )}
        <button onClick={onClick} data-cy="singlesiteBtn">
          To Single Site
        </button>
      </div>
    </>
  );
};

export default EditPanel;
