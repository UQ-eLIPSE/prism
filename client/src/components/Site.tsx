import React, { useEffect, useRef, useState } from "react";
import "../sass/App.scss";
import "../utils/Marzipano/Marzipano.scss";
import InfoPanel from "./InfoPanel";
import Minimap from "./Minimap";
import Timeline from "./Timeline";
import TimelineButton from "./TimelineButton";
import LinkNodes from "./LinkNodes";
import Marzipano from "../utils/Marzipano/Marzipano";
import { NodeData, InitialViewParameters } from "../interfaces/NodeData";
import NetworkCalls from "../utils/NetworkCalls";
import { HotspotDescription } from "../interfaces/HotspotDescription";
import LevelSlider from "./LevelSlider";
import { ISettings } from "../typings/settings";
import UploadFiles from "./UploadFiles";
import TitleCard from "./TitleCard";
import { useUserContext } from "../context/UserContext";

export interface MinimapReturn {
  image_url: string;
  floor: number;
  site: string;
  image_large_url: string;
  x_pixel_offset: number;
  y_pixel_offset: number;
  x_scale: number;
  y_scale: number;
  img_width: number;
  img_height: number;
  xy_flipped: boolean;
  __v: number;
}

interface SiteInterface {
  siteId: string;
  config: ISettings;
  updateFloor: (floor: number) => void;
}

function Site(props: SiteInterface) {
  const { siteId, config, updateFloor } = props;
  const marzipano = useRef<Marzipano>();
  const sideNavOpen = false;

  const enableTimeline = config.enable.timeline;
  const abortController: AbortController[] = [];
  const hotspotAbortController = new AbortController();
  const minimapImagesAbortController = new AbortController();
  const panoRef = useRef<HTMLDivElement>(null);
  const [user] = useUserContext();

  const [currDate, setCurrDate] = useState<Date>(
    new Date(Date.parse(config.initial_settings.date)),
  );
  const [currPanoId, setCurrPanoId] = useState<string>(
    config.initial_settings.pano_id,
  );
  const [currRotation, setCurrRotation] = useState<number>(0);

  const [currViewParams, setCurrViewParams] = useState<InitialViewParameters>({
    ...config.initial_settings,
  });

  const [currfloor, setCurrFloor] = useState<number>(
    config.initial_settings.floor,
  );
  const [floors, setFloors] = useState<number[]>([]);

  const [floorExists, setFloorExists] = useState<boolean>(false);
  const [infoPanelId, setInfoPanelId] = useState<string>("");
  const [infoPanelOpen, setInfoPanelOpen] = useState<boolean>(false);
  const [minimapEnlarged, setMinimapEnlarged] = useState<boolean>(false);
  const [nodesData, setNodesData] = useState<NodeData[]>([]);
  const [timelineOpen, setTimelineOpen] = useState<boolean>(true);
  const [linkNodeListOpen, setLinkNodeListOpen] = useState<boolean>(false);
  const [hotspotDictionary, setHotspotDictionary] = useState<
    HotspotDescription[]
  >([]);
  const [minimap, setMinimap] = useState<MinimapReturn | null>();
  const [floorTag, setFloorTag] = useState<string>("");
  const [availableFloors, setAvailableFloors] = useState<number[]>([0]);

  useEffect(() => {
    getSurveyNodes(currfloor);
    getFloorExistence(currfloor);
    updateFloor(currfloor);

    (async () => {
      await updateFloors();
    })();
  }, [currfloor, currDate]);

  const updateFloors = async (): Promise<void> => {
    try {
      const resJSON = await NetworkCalls.getFloors(siteId, currDate);
      if (resJSON.success) {
        const empty = await NetworkCalls.getEmptyFloors(siteId);
        const usableFloors = new Set<number>([
          ...resJSON.payload.map((e: MinimapReturn) => e.floor),
          ...empty.emptyFloors,
        ]);
        setFloors([...Array.from(usableFloors)]);

        if (!usableFloors.has(currfloor)) {
          changeFloor(Math.min(...floors));
          updateAvailableFloors(floors);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  async function getFloorExistence(floor: number) {
    try {
      if (floor !== Infinity) {
        const floorSurveyExists: {
          siteId: string;
          floor: string;
          floorPopulated: boolean;
        } = await NetworkCalls.getFloorSurveyExistence(siteId, floor);

        if (floorSurveyExists) {
          await setFloorExists(floorSurveyExists.floorPopulated);
          if (config.enable.timeline && !floorExists) setTimelineOpen(false);
        } else {
          throw new Error("Floor information could not be found");
        }
      }
    } catch (e) {
      window.alert(e);
    }
  }

  function updateCurrPano(panoId: string): void {
    setCurrPanoId(panoId);
    getHotspotDescriptionList(panoId);
  }

  // Clicking on an info node switches view toward that node, and opens info panel
  function infoNodeClick(
    infoYaw: number,
    infoPitch: number,
    info_id: string,
  ): void {
    // Updated view params
    const viewParams = {
      ...currViewParams,
      pitch: infoPitch,
      yaw: infoYaw,
    };
    // Check marzipano is not undefined
    if (!marzipano.current) throw new Error("Marzipano is undefined.");
    marzipano.current.panUpdateCurrView(
      viewParams,
      marzipano.current.findSceneById(currPanoId),
    );
    updateViewParams(viewParams);
    // Open info panel
    // console.log("info click", info_id);
    getInfoHotspot(info_id);
  }

  function minimapClick(panoId: string): void {
    if (marzipano.current)
      marzipano?.current?.switchScene(marzipano.current.findSceneById(panoId));
  }

  function updateRotation(rotation: number): void {
    setCurrRotation(rotation);
  }

  function updateViewParams(viewParams: InitialViewParameters): void {
    setCurrViewParams(viewParams);
  }

  function getSurveyNodes(floor = 0): void {
    const viewParams = currViewParams;

    if (floor !== Infinity) {
      if (marzipano.current !== undefined) {
        marzipano.current.viewer.domElement().innerHTML = "<div></div>";
        marzipano.current.viewer.destroyAllScenes();

        if (abortController.length > 1) {
          abortController[abortController.length - 1].abort();
          abortController.pop();
        }
      } else {
        abortController.push(new AbortController());
        NetworkCalls.fetchSurveyNodes(
          floor,
          siteId,
          abortController[abortController.length - 1],
          currDate,
        ).then((nodesData) => {
          panoRef?.current?.childNodes && panoRef?.current?.replaceChildren("");

          if (!nodesData || !nodesData.length) return;

          setNodesData(nodesData);

          // Get correct minimap image on initial load.
          getMinimapImage(floor);
          if (!marzipano.current) {
            marzipano.current = new Marzipano(
              nodesData,
              getInfoHotspot,
              updateCurrPano,
              updateRotation,
              updateViewParams,
              changeInfoPanelOpen,
              config,
            );
          }
          // Get current tile id based on previous node number
          let currentTilesId = nodesData[0].minimap_node.tiles_id;
          let xDifference = 10000;
          let yDifference = 10000;
          const xOffset = currPanoId.split("_")[3];
          const yOffset = currPanoId.split("_")[4];

          for (const node of nodesData) {
            const xDiff = Math.abs(Number(xOffset) - node.x);
            const yDiff = Math.abs(Number(yOffset) - node.y);
            if (
              node.x.toString() === xOffset &&
              node.y.toString() === yOffset
            ) {
              currentTilesId = node.minimap_node.tiles_id;
              break;
            } else if (xDifference > xDiff && yDifference > yDiff) {
              xDifference = xDiff;
              yDifference = yDiff;
              currentTilesId = node.minimap_node.tiles_id;
            }
          }

          minimapClick(
            nodesData.some(
              (e: NodeData) => e.minimap_node.tiles_id === currPanoId,
            )
              ? currPanoId
              : currentTilesId,
          );

          if (
            viewParams.fov !== 0 ||
            viewParams.pitch !== 0 ||
            viewParams.yaw !== 0
          ) {
            if (
              marzipano.current &&
              marzipano.current.findSceneById(currPanoId)
            ) {
              marzipano.current.updateCurrView(
                viewParams,
                marzipano.current.findSceneById(currPanoId),
              );
            }
          }
        });
      }
    }
  }
  function changeDate(date: Date): void {
    setCurrDate(date);
  }

  function updateAvailableFloors(newFloors: number[]) {
    setAvailableFloors(newFloors);
  }

  function updateMinimapEnlarged(minimapEnlarged: boolean): void {
    setMinimapEnlarged(minimapEnlarged);
  }

  /**
   * This function changes the current floor a user is on in a site.
   * @param floor the current floor id that a user has clicked on
   */
  async function changeFloor(floor: number) {
    try {
      if (floor !== Infinity) {
        const res: MinimapReturn = await NetworkCalls.fetchMinimap(
          floor,
          siteId,
          minimapImagesAbortController,
        );
        config.initial_settings.floor = floor;
        setCurrFloor(floor);
        setMinimap(res as MinimapReturn);
      }
    } catch {
      setCurrFloor(floor);
      setMinimap(null);
    }
  }

  function changeInfoPanelOpen(open: boolean): void {
    setInfoPanelOpen(open);
  }

  function changeTimelineOpen(open: boolean): void {
    setTimelineOpen(open);
  }

  // Loads all HotspotDescriptions for the current survey location.
  async function getHotspotDescriptionList(tilesId: string): Promise<void> {
    try {
      const res: HotspotDescription[] =
        await NetworkCalls.fetchHotspotDescription(
          tilesId,
          siteId,
          hotspotAbortController,
        );
      setHotspotDictionary(res);
    } catch (e) {
      // Corrupted HotspotDescription, replace with empty.
      setHotspotDictionary([]);
    }
  }

  // Handles clicking on hotspot.
  function getInfoHotspot(info_id: string): void {
    setInfoPanelId(info_id);
    setInfoPanelOpen(true);
  }

  function getHotspotDescription(
    info_id: string,
  ): HotspotDescription | undefined {
    const res: HotspotDescription[] = hotspotDictionary ?? [];
    return res.find((x) => x.info_id === info_id);
  }

  // Get current minimap image for the current floor.
  async function getMinimapImage(floor: number): Promise<void> {
    try {
      if (floor !== Infinity) {
        const res: MinimapReturn = await NetworkCalls.fetchMinimap(
          floor,
          siteId,
          minimapImagesAbortController,
        );

        setMinimap(res as MinimapReturn);
      }
    } catch (e) {
      // Corrupted MinimapImage, replace with empty.
      setMinimap(null);
    }
  }

  // Update link node menu (open or close)
  function updateLinkNodes(state: boolean): void {
    setLinkNodeListOpen(state);
  }

  // Handles link/info hotspot dropdown click
  function handleDropdownClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    state: boolean,
  ): void {
    if (!config.enable.hotspots_nav) {
      return;
    }
    e.stopPropagation();
    // Close minimap on dropdown click
    updateMinimapEnlarged(false);
    // Open or close menu if not already
    updateLinkNodes(state);
  }

  return (
    <div id="sitePage">
      <TitleCard
        firstLineName={config.display.title}
        timelineOpen={timelineOpen}
      />
      <div
        className={`linkButton ${!config.enable.hotspots_nav && "disabled"}`}
        onClick={(e): void => handleDropdownClick(e, !linkNodeListOpen)}
        style={{ zIndex: 9 }}
      >
        {linkNodeListOpen ? (
          <i className="fas fa-chevron-up" />
        ) : (
          <i className="fas fa-chevron-down" />
        )}
      </div>
      {linkNodeListOpen && (
        <LinkNodes
          linkNodes={marzipano.current?.findLinkNodesById(currPanoId) ?? ""}
          infoNodes={marzipano.current?.findInfoNodesById(currPanoId) ?? ""}
          timelineOpen={timelineOpen}
          onLinkNodeClick={minimapClick}
          onInfoNodeClick={infoNodeClick}
          listOpen={linkNodeListOpen}
          updateLinkNodes={updateLinkNodes}
        />
      )}
      {enableTimeline && (
        <TimelineButton
          timelineOpen={timelineOpen}
          changeTimelineOpen={changeTimelineOpen}
          floorExists={floorExists}
        />
      )}
      <hr className="timelineIndicator" />
      {infoPanelOpen && (
        <InfoPanel
          sideNavOpen={sideNavOpen}
          infoPanelOpen={infoPanelOpen}
          changeInfoPanelOpen={changeInfoPanelOpen}
          hotspotDescription={getHotspotDescription(infoPanelId)}
        />
      )}
      <div id="uploadFilesPano">
        {user?.isAdmin && !floorExists ? (
          <UploadFiles
            siteId={siteId}
            mode={"addScene"}
            floorData={minimap ? minimap : undefined}
            setFloorExists={setFloorExists}
          />
        ) : (
          <div
            id="pano"
            ref={panoRef}
            onClick={(e): void => handleDropdownClick(e, false)}
          ></div>
        )}
      </div>
      <div className="minimapCorner">
        <Minimap
          currPanoId={currPanoId}
          onClickNode={minimapClick}
          currRotation={currRotation}
          minimapEnlarged={minimapEnlarged}
          updateMinimapEnlarged={updateMinimapEnlarged}
          nodeData={nodesData}
          sideNavOpened={sideNavOpen}
          config={config}
          linkNodeFunction={updateLinkNodes}
          timelineOpen={timelineOpen}
          closeTimelineFunction={changeTimelineOpen}
          minimapData={minimap}
          floor={currfloor}
          siteId={siteId}
          getMinimapImage={getMinimapImage}
          updateFloorTag={(input: string) => setFloorTag(input)}
          minimapShown={floorExists}
          currDate={currDate}
        />
        {config.enable.floors && !minimapEnlarged && (
          <LevelSlider
            timelineOpen={timelineOpen}
            floor={currfloor}
            changeFloor={changeFloor}
            date={currDate}
            configFloor={config.num_floors}
            siteId={siteId}
            floorTag={floorTag}
            availableFloors={floors}
          />
        )}
      </div>
      {config.enable.timeline && (
        <Timeline
          timelineOpen={timelineOpen}
          floor={currfloor}
          changeFloor={changeFloor}
          date={currDate}
          changeDate={changeDate}
          closeTimelineFunction={changeTimelineOpen}
          siteId={siteId}
          updateAvailableFloors={updateAvailableFloors}
          availableFloors={availableFloors}
          floorExists={floorExists}
          updateFloors={updateFloors}
        />
      )}
    </div>
  );
}

export default Site;
