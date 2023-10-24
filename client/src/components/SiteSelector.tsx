import React, { useEffect, useState } from "react";
import EditPanel from "../components/EditPanel";
import NetworkCalls from "../utils/NetworkCalls";
import { FormattedMessage } from "react-intl";
import prism_logo from "../img/prism-logo.svg";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import SitemapMenu from "./SitemapMenu";
import SitePinModal from "./Modal/SitePinModal";
import SiteMapModal from "./Modal/SiteMapModal";
export interface PinData {
  _id: string;
  site: string; //site id
  name: string;
  x: number;
  y: number;
  icon: string;
  cover_image: string;
  external_url?: string;
  enabled: boolean;
  sitemap: string;
}

export interface SitemapInterface {
  name: string;
  image_url: string;
}
/**
 * Enum of all possible editing functions
 */
export enum EditingFunctions {
  MOVE = "move",
  DELETE = "delete",
  HIDE = "hide",
  ADD = "add",
  CHANGE = "change",
  REDIRECT = "redirect",
  DEFAULT = "",
  SAVE = "save",
}
/**
 * Hook which encapsulates the network request
 * @returns State for getting pins
 */
export function useGetPins() {
  const [pins, setPins] = useState<PinData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<string>("");

  useEffect(() => {
    const getMapPins = async () => {
      setIsLoading(true);
      try {
        const req = await NetworkCalls.getMapPins(new AbortController());
        setPins(req);
      } catch (e) {
        setIsError("request failed");
      } finally {
        setIsLoading(false);
      }
    };
    getMapPins();
  }, []);

  return { pins, setPins, isLoading, isError };
}

/**
 * Function to render and edit site pins on the map
 */
interface SiteSelectorProps {
  onButtonClick: () => void;
}

function SiteSelector({ onButtonClick }: SiteSelectorProps) {
  const [user] = useUserContext();
  // Array of all pins on the map
  const { pins, setPins } = useGetPins();
  //current edit selection
  const [editState, setEditState] = useState<EditingFunctions>(
    EditingFunctions.DEFAULT,
  );
  //state for rendering the add/edit modal
  const [sitePinModal, setSitePinModal] = useState<boolean>(false);
  //state for rendering the add/edit a site map modal
  const [sitemapModal, setSitemapModal] = useState<boolean>(false);
  //state for showing a helpful tip to inform users on how to add a pin
  const [addPinInfo, setAddPinInfo] = useState<boolean>(false);
  //allocate new coordinates for a pin location
  const [newCoords, setNewCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [currentlyDragged, setCurrentlyDragged] = useState<boolean>(false);
  const [movement, updateMovement] = useState<number[]>([0, 0]);
  //selected site pin
  const [selectedSite, setSelectedSite] = useState<PinData>({
    _id: "",
    site: "",
    name: "",
    x: 0,
    y: 0,
    icon: "",
    cover_image: "",
    enabled: false,
    sitemap: "",
  });
  //boolean which only toggles when the move button is selected
  const [save, setSave] = useState<boolean>(false);
  const navigate = useNavigate();
  // renders the homepage map to set pins on
  const [sitemap, setSitemap] = useState<SitemapInterface>({
    name: "",
    image_url: "",
  });
  // TODO fi fi-ss-wheat -> Farm to be changed to this once UIcons CDN is updated. Request email has been sent on 29/03.
  const iconClasses: { [key: string]: string } = {
    learn: "fa-solid fa-graduation-cap",
    shop: "fa-solid fa-shopping-cart",
    farm: "fa-solid fa-leaf",
    pig: "fa-solid fa-piggy-bank",
    animal: "fa-solid fa-cow",
    truck: "fa-solid fa-truck-fast",
  };

  /**
   * This will either render a default sitemap or the last map that the user
   * was on when they refresh the page
   * currentSitemap checks if there was a map that the user clicked on last
   * besides 'default'
   */
  useEffect(() => {
    const currentSitemap = localStorage.getItem("currentSitemap");
    // load sitemap image on first render
    (async () => {
      const getSiteMap = currentSitemap
        ? await NetworkCalls.getSiteMap(currentSitemap)
        : await NetworkCalls.getSiteMap();
      const data = getSiteMap.payload;
      setSitemap({
        name: data?.name ? data.name : "",
        image_url: data?.image_url ? data.image_url : "",
      });
    })();
  }, []);

  /**
   * This function retrieves a specific map to be rendered on the
   * homepage
   * @param mapName the name of the sitemap
   */
  interface getSiteMap_payload {
    _id: string;
    name: string;
    image_url: string;
    tag: string;
  }
  interface response_getSiteMap {
    message: string;
    payload: getSiteMap_payload;
    success: boolean;
  }
  async function getSitemap(mapName: string) {
    NetworkCalls.getSiteMap(mapName).then((res: response_getSiteMap) => {
      const data = res.payload;
      setSitemap({
        name: data?.name ? data.name : "",
        image_url: data?.image_url ? data.image_url : "",
      });
    });
  }

  /**
   * Function to add a pin to the map
   * @param newPin pin object
   */
  async function addPin(newPin: PinData) {
    //if a pin param has been passed then add it to the array
    setPins([...pins, newPin]);
    //api call to add to database
    try {
      await NetworkCalls.addMapPin(newPin, new AbortController());
      const req = await NetworkCalls.getMapPins(new AbortController());
      setPins(req);
    } catch (e) {
      window.alert(`Error! \n\n Failed to Add Pin. \n ${e}`);
    }
  }

  /**
   * This function renders the colour of the pin based off the pin id being
   * equal to the selectedSite
   * @param pin
   * @returns either a grey or blue coloring classname
   */
  function renderSelectedPinColor(pin: PinData) {
    if (pin._id !== selectedSite?._id) {
      if (pin.enabled) {
        return "bottom enabled";
      } else {
        return "bottom disabled";
      }
    } else {
      return "bottom selected";
    }
  }

  /**
   * Returns all pins and the state of a selected pin and its editing function. I.e if delete pin was selected on a pin then
   * trigger the function for deleting the pin
   * @param pinData the selected site pin
   * @returns void
   */
  function returnPins() {
    return pins.map((pinData: PinData, index: number) => {
      return pinData.enabled || user?.isAdmin ? (
        // window.open(`/map/${siteData.siteId}`, "_self"); <-- Change div onClick to this once ids are properly implemented. Trying this with an incorrect id will break the server. Opens a Google search page in a new tab for the time being.
        // Handles each individual pin
        <div
          data-ispin
          key={index}
          id={`${pinData.site}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!editState) {
              if (!user?.isAdmin) {
                if (pinData.external_url) {
                  window.location.href = pinData.external_url;
                } else {
                  navigate(`/site/${pinData.site}/site`);
                }
              } else {
                setSelectedSite(pinData);
              }
            }
          }}
          onMouseDown={() => {
            switch (editState) {
              case "move":
                if (selectedSite?._id === pinData._id) {
                  setCurrentlyDragged(true);
                }
                break;
              case "delete":
                deleteMapPin(pinData);
                break;
            }
          }}
          onMouseMove={(e) => {
            if (currentlyDragged) {
              movePin(e, pinData);
            }
          }}
          onMouseLeave={() => {
            setCurrentlyDragged(false);
          }}
          onMouseUp={() => {
            if (editState === "move") {
              setCurrentlyDragged(false);
              updateMovement([0, 0]);
            }
          }}
          // if the pins sitemap is the same as the map displayed when show the pin otherwise hide it
          className={`pin 
                    ${!pinData.enabled ? "disabled" : "enabled"}
                    ${
                      editState === "move" && pinData._id === selectedSite?._id
                        ? "move"
                        : "enabled"
                    }
                    ${pinData._id === selectedSite?._id && "selected"}
                    ${
                      pinData.sitemap === sitemap?.name
                        ? renderSelectedPinColor(pinData)
                        : `hidden`
                    }
                `}
          style={{
            left: `${pinData.x}%`,
            top: `${pinData.y}%`,
          }}
        >
          <div
            data-ispin
            className="image"
            style={{
              backgroundImage: pinData.enabled
                ? `url(${pinData.cover_image})`
                : `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${pinData.cover_image})`,
            }}
          >
            {!pinData.enabled && (
              <>
                <i className="fa-regular fa-eye-slash"></i>
                <p>
                  <FormattedMessage id="siteDisabled" />
                </p>
              </>
            )}
          </div>
          <div data-ispin className={renderSelectedPinColor(pinData)}>
            <p data-ispin>{pinData.name}</p>
            <i
              data-ispin
              className={
                pinData.enabled
                  ? iconClasses[pinData.icon]
                  : "fa-regular fa-eye-slash"
              }
            ></i>
          </div>
        </div>
      ) : (
        <React.Fragment key={index}></React.Fragment>
      );
    });
  }
  /**
   * Calculates % offsets for the map and calls addPin() to add a pin to the state.
   *
   * @param event click event when clicking map.
   */
  function getCoordinates(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void {
    const domRect = document.getElementById("pins");
    if (domRect) {
      const domRectData = domRect.getBoundingClientRect();

      const xClickCoord: number = event.pageX;
      const yClickCoord: number = event.pageY;

      const xOffset: number = domRectData.x;
      const yOffset: number = domRectData.y;

      const mapWidth: number = domRectData.width;
      const mapHeight: number = domRectData.height;

      // Calculate % x and y in number form. E.g., 60% = 60
      // addPin(((xClickCoord - xOffset) / mapWidth) * 100, ((yClickCoord - yOffset) / mapHeight) * 100);
      setNewCoords({
        x: ((xClickCoord - xOffset) / mapWidth) * 100,
        y: ((yClickCoord - yOffset) / mapHeight) * 100,
      });
    }
  }

  /**
   * Wrapper function for update map pins coordinates network call
   * @param pin updated map pin
   * @returns
   */
  async function updateMapPinCoords(pin: PinData): Promise<void> {
    try {
      await NetworkCalls.updateMapPinCoords(pin);
    } catch (e) {
      window.alert(`Error! \n\n Failed to Update New Pin Coordinates \n ${e}`);
    }
  }

  /**
   * Moves a site pin
   * @param event mouse movement, used for getting position of the mouse
   * @param pin given site
   */
  function movePin(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pin: PinData,
  ) {
    const domRect = document.getElementById("pins");

    if (domRect) {
      const mapWidth: number = domRect.getBoundingClientRect().width;
      const mapHeight: number = domRect.getBoundingClientRect().height;

      //Get the pin that is to be moved
      const movePin: PinData = pins.filter(
        (tempPin: PinData) => tempPin.site === pin.site,
      )[0];

      //get the new coords og
      const updatedX: number = movePin.x + (event.movementX / mapWidth) * 100;
      const updatedY: number = movePin.y + (event.movementY / mapHeight) * 100;

      if (
        updatedX > 0 &&
        updatedX < 100 &&
        updatedY > 0 &&
        updatedY < 100 &&
        movePin.site === pin.site
      ) {
        movePin.x = updatedX;
        movePin.y = updatedY;

        updateMovement([
          movement[0] + event.movementX,
          movement[1] + event.movementY,
        ]);
      }
    }
  }

  /**
   * Deletes a given map pin to both the pin array and the backend database
   * @param site site to delete
   */
  const deleteMapPin = async (pin: PinData) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${pin.name} from the map?`,
      )
    ) {
      setPins(pins.filter((tempPin: PinData) => tempPin._id !== pin._id));
      //network request delete from api
      try {
        await NetworkCalls.deleteSitePin(pin._id);
      } catch (err) {
        window.alert(`Could not delete pin, ${err}`);
      }
    }
    setSelectedSite({
      _id: "",
      site: "",
      name: "",
      x: 0,
      y: 0,
      icon: "",
      cover_image: "",
      enabled: false,
      sitemap: "",
    });
    setEditState(EditingFunctions.DEFAULT);
  };

  /**
   * toggle hide state of a given pin
   * @param site site to toggle
   */
  const toggleHide = async (updatedPin: PinData) => {
    try {
      updatedPin.enabled = !updatedPin.enabled;
      await NetworkCalls.editSitePin(updatedPin);
    } catch (err) {
      window.alert(err);
    }
    setPins(
      pins.map((pin: PinData) => {
        if (pin._id === updatedPin._id) {
          pin = updatedPin;
        }
        return pin;
      }),
    );
  };

  /**
   * Edit site pin information
   * Sets the changePin to the selected pin and passes this as a prop to Modal.tsx to render
   * @param pin the selected pin
   */
  function setUpdatePinStates(pin: PinData): void {
    setSelectedSite(pin);
    setSitePinModal(true);
  }

  /**
   * Edit Pin Function
   * This function removes the existing pin from the array and reinserts it with
   * the new name, and selected icon
   * @param newSite existing site pin info
   * @param newName new site pin name
   * @param newIcon new site pin icon
   */
  const updatePin = async (updatedSite: PinData): Promise<void> => {
    //network request
    try {
      await NetworkCalls.editSitePin(updatedSite);
      setPins([
        ...pins.filter((pin: PinData) => pin._id !== updatedSite._id),
        {
          _id: updatedSite._id,
          site: updatedSite.site,
          enabled: updatedSite.enabled,
          x: updatedSite.x,
          y: updatedSite.y,
          cover_image: updatedSite.cover_image,
          icon: updatedSite.icon,
          name: updatedSite.name,
          external_url: updatedSite.external_url,
          sitemap: updatedSite.sitemap,
        },
      ]);
      //show the updated values in the modal
      setSelectedSite({
        _id: updatedSite._id,
        site: updatedSite.site,
        enabled: updatedSite.enabled,
        x: updatedSite.x,
        y: updatedSite.y,
        cover_image: updatedSite.cover_image,
        icon: updatedSite.icon,
        name: updatedSite.name,
        external_url: updatedSite.external_url,
        sitemap: updatedSite.sitemap,
      });
    } catch (err) {
      window.alert(`Could not update pin, ${err}`);
    }
  };

  return (
    <>
      {/* modal is a boolean, if true then render the pop up modal (for editing/adding pins)*/}
      {sitePinModal && (
        <SitePinModal
          toggleModalView={setSitePinModal}
          addPin={addPin}
          newCoords={newCoords}
          setEditState={setEditState}
          setAddPinInfo={setAddPinInfo}
          sitemapName={sitemap.name}
          updatePin={updatePin}
          pinEditState={editState}
          site={selectedSite}
        />
      )}
      {sitemapModal && (
        <SiteMapModal
          toggleSiteMapModal={setSitemapModal}
          setPins={setPins}
          setSitemap={setSitemap}
        />
      )}
      <div className="sitehome-container">
        <div className="sitehome-title-container">
          <span></span>

          {/* To be changed to the project title. E.g., Agricultural Corridor */}
          <span>
            <div className="site-title">
              <img
                className="prism-title-icon"
                src={prism_logo}
                alt="prism logo"
              />
              <h1>
                {(process.env.REACT_APP_PROJECT_TITLE as string) ||
                  "PROJECT TITLE"}
              </h1>
            </div>
          </span>

          <span>
            {addPinInfo && (
              <div className="add-pin-message site-title">
                <h2>
                  <FormattedMessage id="clickOnAnywhere" />
                </h2>
              </div>
            )}
          </span>
        </div>
        <div className="sitehome-map-container">
          <div className="site-pins-container">
            <div className="map-box">
              <div
                id="pins"
                onClick={(e) => {
                  switch (editState) {
                    case EditingFunctions.ADD:
                      getCoordinates(e);
                      setEditState(EditingFunctions.DEFAULT);
                      setAddPinInfo(true);
                      setSitePinModal(true);
                      break;
                    case EditingFunctions.MOVE:
                      setEditState(EditingFunctions.MOVE);
                      break;
                    default:
                      setEditState(EditingFunctions.DEFAULT);
                      setSelectedSite({
                        _id: "",
                        site: "",
                        name: "",
                        x: 0,
                        y: 0,
                        icon: "",
                        cover_image: "",
                        enabled: false,
                        sitemap: "",
                      });
                      break;
                  }
                }}
              >
                {returnPins()}
              </div>
              <img src={sitemap?.image_url} alt="Site Map" className="map" />
            </div>
          </div>
          <SitemapMenu
            pins={pins}
            setSitemap={setSitemap}
            getSitemap={getSitemap}
          />

          {/* Side editing panel */}
          {(process.env.REACT_APP_USE_SSO === "false" ||
            (user && user.isAdmin)) && (
            <div className="edit-flex-box">
              <EditPanel
                selectedSite={selectedSite}
                toggleMove={() => setEditState(EditingFunctions.MOVE)}
                toggleAdd={() => setEditState(EditingFunctions.ADD)}
                deletePin={deleteMapPin}
                hidePin={toggleHide}
                setEditState={setEditState}
                editState={editState}
                save={save}
                setSave={setSave}
                setUpdatePinStates={setUpdatePinStates}
                setAddPinInfo={setAddPinInfo}
                updateSiteCoords={updateMapPinCoords}
                addPinInfo={addPinInfo}
                setSitemapModal={setSitemapModal}
                onClick={onButtonClick}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SiteSelector;
