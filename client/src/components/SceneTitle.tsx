import React, { useEffect, useState } from "react";
import NetworkCalls from "../utils/NetworkCalls";
import QueueIcon from "@mui/icons-material/Queue";
import { PinData } from "./SiteSelector";

const iconClasses: { [key: string]: string } = {
  edit: "fa-solid fa-pen",
};

interface SceneTitleProps {
  siteId: string;
  mode: string;
  floor?: number;
}

const SceneTitle: React.FC<SceneTitleProps> = ({ siteId, mode, floor }) => {
  const [sceneName, setSceneName] = useState<string>("");
  const [floorName, setFloorName] = useState<string>("");
  const [siteInputWidth, setSiteInputWidth] = useState(0);
  const [siteData, setSiteData] = useState<PinData>({
    name: "Unknown Site",
    icon: "question",
    _id: "",
    site: "",
    x: 0,
    y: 0,
    cover_image: "",
    enabled: false,
    sitemap: "",
  });

  useEffect(() => {
    async function getFloorDetails() {
      if (floor && floor !== -1) {
        await NetworkCalls.fetchMinimap(
          floor,
          siteId,
          new AbortController(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).then((res: any) => setFloorName(res.floor_name));
      }
    }

    getFloorDetails();
  }, [floor]);

  useEffect(() => {
    const getMapPins = async () => {
      const reqRaw = await fetch(`${window._env_.API_URL}/api/map-pins`);
      const req = await reqRaw.json();
      if (req.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.payload.forEach((data: any) => {
          if (data.site === siteId) {
            setSiteData(data);
            setSceneName(data.name);
            setSiteInputWidth(data.name.length + 2);
          }
        });
      }
    };
    getMapPins();
  }, [siteId]);

  /**
   * This function updates the new sceneName to the database
   * @param newTitle new site name
   */
  async function updateSiteTitle(newTitle: string) {
    if (newTitle !== siteData.name) {
      const updatedSite: PinData = {
        ...siteData,
        name: newTitle,
      };

      try {
        await NetworkCalls.editSitePin(updatedSite);
      } catch (err) {
        window.alert(`Could not update pin title!, ${err}`);
      }
    }
  }

  /**
   * This function saves the new site name if the user clicks the enter key, they should also exit from the input
   * form.
   * @param e the event listener
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      if (sceneName.length === 0) {
        window.alert(`Error! \n\n You need a site name! \n `);
        setSceneName(siteData.name);
      } else {
        updateSiteTitle(e.currentTarget.textContent as string);
        document.getElementById("site-upload-title")?.blur();
      }
    }
  };
  return (
    <>
      {mode == "addNewSite" && (
        <div
          className="site-title"
          style={{
            width: siteInputWidth + 10 + "vw",
            marginLeft: "1.5em",
            marginTop: "1.5em",
          }}
        >
          <i style={{ color: "grey" }} className={iconClasses["edit"]}></i>
          <input
            type="text"
            id="site-upload-title"
            value={sceneName}
            style={{ width: siteInputWidth + "vw" }}
            onChange={(e) => {
              e.preventDefault();
              setSceneName(e.currentTarget.value);
              if (e.target.value.length <= 15) {
                setSiteInputWidth(15);
              } else {
                setSiteInputWidth(e.target.value.length + 2);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e)}
            onBlur={() => {
              if (sceneName.length === 0) {
                window.alert(`Error! \n\n You need a site name! \n `);
                setSceneName(siteData.name);
              } else {
                updateSiteTitle(sceneName);
              }
            }}
          />
        </div>
      )}
      {mode == "addScene" && (
        <div
          className="site-title"
          style={{ width: "25vw", margin: "1em 0em 0em 1em" }}
        >
          <QueueIcon style={{ color: "#000000" }} />
          <h1 style={{ color: "#000000" }}>
            Add Scenes{floor !== -1 && ` - ${floorName}`}
          </h1>
        </div>
      )}
    </>
  );
};

export default SceneTitle;
