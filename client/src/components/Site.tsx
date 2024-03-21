import React, { useEffect, useRef, useState } from "react";
import "../sass/App.scss";
import "../utils/Marzipano/Marzipano.scss";
import InfoPanel from "./InfoPanel";
import Minimap from "./Minimap/Minimap";
import Timeline from "./Timeline";
import TimelineButton from "./TimelineButton";
import LinkNodes from "./LinkNodes";
import MarzipanoHelper from "../utils/Marzipano/Marzipano";
import {
  NodeData,
  InitialViewParameters,
  NodeConfiguration,
  NearestNode,
} from "../interfaces/NodeData";
import NetworkCalls from "../utils/NetworkCalls";
import { HotspotDescription } from "../interfaces/HotspotDescription";
import LevelSlider from "./LevelSlider";
import { ISettings } from "../typings/settings";
import UploadFiles from "./UploadFiles";
import TitleCard from "./TitleCard";
import { useUserContext } from "../context/UserContext";
import { SurveyMonth } from "../interfaces/NodeData";
import MinimapUtils from "./Minimap/MinimapUtils";
import MarzipanoDisplayInfo from "./MarzipanoDisplayInfo";

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

  floor_name: string;
  floor_tag: string;
  image: string;
}

const MinimapInitial = {
  image_url: "",
  floor: 0,
  site: "",
  image_large_url: "",
  x_pixel_offset: 0,
  y_pixel_offset: 0,
  x_scale: 1,
  y_scale: 1,
  img_width: 1,
  img_height: 1,
  xy_flipped: false,
  __v: 0,

  floor_name: "",
  floor_tag: "",
  image: "",
};
interface SiteInterface {
  siteId: string;
  config: ISettings;
  updateFloor: (floor: number) => void;
}

function Site(props: SiteInterface) {
  const { siteId, config, updateFloor } = props;
  const marzipano = useRef<MarzipanoHelper>();
  const sideNavOpen = false;

  const enableTimeline = config.enable.timeline;

  const abortController: AbortController[] = [];
  const surveyAbortController = new AbortController();
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

  const [lastRotation, setLastRotation] = useState<number>(0);

  const [currViewParams, setCurrViewParams] = useState<InitialViewParameters>({
    ...config.initial_settings,
  });
  const [lastViewParams, setLastViewParams] =
    useState<InitialViewParameters | null>(null);

  const [currfloor, setCurrFloor] = useState<number>(
    config.initial_settings.floor,
  );
  const [floors, setFloors] = useState<number[]>([]);

  const [surveys, setSurveys] = useState<SurveyMonth[]>([]);
  const [allSurveys, setAllSurveys] = useState<SurveyMonth[]>([]);

  const [floorExists, setFloorExists] = useState<boolean>(false);
  const [infoPanelId, setInfoPanelId] = useState<string>("");
  const [infoPanelOpen, setInfoPanelOpen] = useState<boolean>(false);
  const [minimapEnlarged, setMinimapEnlarged] = useState<boolean>(false);
  const [nodesData, setNodesData] = useState<NodeData[]>([]);
  const [timelineOpen, setTimelineOpen] = useState<boolean>(
    config.enable.timeline,
  );
  const [linkNodeListOpen, setLinkNodeListOpen] = useState<boolean>(false);
  const [hotspotDictionary, setHotspotDictionary] = useState<
    HotspotDescription[]
  >([]);
  const [minimap, setMinimap] = useState<MinimapReturn>(MinimapInitial);
  const [floorTag, setFloorTag] = useState<string>("");
  const [availableFloors, setAvailableFloors] = useState<number[]>([0]);
  const [nodeState, setNodeState] = useState<NodeConfiguration>({
    x_position: parseFloat(currPanoId.split("_")[3]),
    y_position: parseFloat(currPanoId.split("_")[4]),
    rotation: 0,
  });

  // Used to detect if page is being rendered for the first time (not switching floors).
  const [initialRender, setInitialRender] = useState<boolean>(true);

  useEffect(() => {
    if (marzipano.current) {
      marzipano.current = undefined;
    }
    const getNodesAndFloorData = async () => {
      await getFloorExistence(currfloor);
      getSurveyNodes(currfloor);
    };

    (async () => {
      // Firstly check if the floor exists and obtain survey nodes.
      await getNodesAndFloorData();

      // Update correspondingly floors based on prior async data.
      updateFloor(currfloor);
      await updateFloors();
    })();
  }, [currfloor, currDate, floorExists]);

  //The second useEffect is necessary because it isolates survey data updates to occur only when `currDate` changes,
  // ensuring that these updates are decoupled from floor-related operations.
  useEffect(() => {
    (async () => {
      await updateSurveys();
    })();
  }, []);

  useEffect(() => {
    if (!lastViewParams) return;
    if (marzipano.current && marzipano.current.findSceneById(currPanoId)) {
      marzipano.current.updateCurrView(
        lastViewParams,
        marzipano.current.findSceneById(currPanoId),
      );
      marzipano.current.updateRotation(lastRotation);
    }
  }, [currPanoId]);

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

  const updateSurveyData = (
    surveyWithFloors: SurveyMonth[],
    siteSurveys: SurveyMonth[],
  ): void => {
    setSurveys(surveyWithFloors); // Set the surveys with floor information
    setAllSurveys(siteSurveys); // Set all surveys
    try {
      //The changeDateAndUpdateFloors function is crucial within updateSurveyData as it ensures the application's state aligns with the selected survey date,
      // triggering necessary updates like floor information refreshment.
      changeDateAndUpdateFloors(siteSurveys[0]?.dates[0]?.date);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSurveys = async (): Promise<void> => {
    try {
      const surveyWithFloors = await NetworkCalls.fetchSurveys(
        surveyAbortController,
        siteId,
        currfloor,
      );
      const siteSurveys = await NetworkCalls.fetchSurveys(
        surveyAbortController,
        siteId,
      );

      updateSurveyData(surveyWithFloors, siteSurveys);
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
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
          setFloorExists((prev: boolean) => {
            prev = floorSurveyExists.floorPopulated;
            return prev;
          });
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
    setCurrPanoId(() => panoId);
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
    getInfoHotspot(info_id);
  }

  function minimapClick(panoId: string): void {
    if (marzipano.current) {
      marzipano?.current?.switchScene(marzipano.current.findSceneById(panoId));
      setLastViewParams(() => null);
      setLastRotation(() => 0);
    }
  }

  function updateRotation(rotation: number): void {
    setCurrRotation(rotation);
    setLastRotation(() => rotation);
  }

  function updateViewParams(viewParams: InitialViewParameters): void {
    if (viewParams === currViewParams) return;
    setCurrViewParams(viewParams);
    setLastViewParams(() => viewParams);
  }

  function updateNodeState(nodeState: NodeConfiguration): void {
    setNodeState(nodeState);
  }

  /**
   * Resets the Marzipano viewer and manages abort controllers for network calls.
   * If a Marzipano instance exists, it clears its DOM and destroys all scenes.
   * It also handles aborting the last network request if necessary. If no Marzipano
   * instance exists, it initializes a new abort controller for upcoming network requests.
   */
  function resetViewerAndAbortCalls(): void {
    if (marzipano.current !== undefined) {
      marzipano.current.viewer.domElement().innerHTML = "<div></div>";
      marzipano.current.viewer.destroyAllScenes();

      if (abortController.length > 1) {
        abortController[abortController.length - 1].abort();
        abortController.pop();
      }
    } else {
      abortController.push(new AbortController());
    }
  }

  /**
   * Fetches and processes survey nodes for a given floor.
   * It makes a network request to fetch survey nodes data, then processes
   * this data to update the state and possibly initialize or update the Marzipano viewer.
   * @param {number} floor - The floor number for which to fetch survey nodes.
   */
  function fetchAndProcessSurveyNodes(floor: number): void {
    NetworkCalls.fetchSurveyNodes(
      floor,
      siteId,
      abortController[abortController.length - 1],
      currDate,
    ).then((nodesData) => {
      panoRef?.current?.childNodes && panoRef?.current?.replaceChildren("");

      if (!nodesData || !nodesData.length) return;

      setNodesData(nodesData);

      getMinimapImage(floor);
      initializeMarzipano(floor, nodesData);
      const nearestNode = MinimapUtils.findNearestNode(nodesData, nodeState);
      updateViewAndMinimap(nearestNode, nodesData);
    });
  }

  /**
   * Initializes Marzipano with survey nodes data if it has not been initialized yet and if the current floor exists.
   * @param {number} floor - The floor number for which the Marzipano viewer is being initialized.
   * @param {Array} nodesData - The data of the nodes retrieved from the survey.
   */
  function initializeMarzipano(floor: number, nodesData: NodeData[]): void {
    if (!marzipano.current && floorExists) {
      marzipano.current = new MarzipanoHelper(
        nodesData,
        getInfoHotspot,
        updateCurrPano,
        updateRotation,
        updateViewParams,
        changeInfoPanelOpen,
        config,
        initialRender,
      );
      setInitialRender(false);
    }
  }

  /**
   * Updates the view and minimap based on the nearest node and nodes data.
   * It updates the current panorama ID and node state, then triggers a click on the minimap.
   * @param {Object} nearestNode - The nearest node's data, including its ID and coordinates.
   * @param {Array} nodesData - The data of the nodes retrieved from the survey.
   */
  function updateViewAndMinimap(
    nearestNode: NearestNode | null,
    nodesData: NodeData[],
  ): void {
    if (nearestNode == null) return;
    setCurrPanoId(nearestNode.nearestNodeId);
    setNodeState((prevState) => ({
      ...prevState,
      x_position: nearestNode.nearestNodeX,
      y_position: nearestNode.nearestNodeY,
    }));

    minimapClick(
      nodesData.some((node) => node.minimap_node.tiles_id === currPanoId)
        ? currPanoId
        : nearestNode.nearestNodeId,
    );

    updateMarzipanoView();
  }

  /**
   * Updates the Marzipano view if the current view parameters (fov, pitch, yaw) are not default.
   * This function checks if the Marzipano viewer and the current scene are initialized,
   * then updates the view parameters if they are not set to their default values.
   */
  function updateMarzipanoView(): void {
    const viewParams = currViewParams;
    setLastViewParams(() => viewParams);
    setLastRotation(() => currRotation);
    if (
      viewParams.fov !== 0 ||
      viewParams.pitch !== 0 ||
      viewParams.yaw !== 0
    ) {
      if (marzipano.current && marzipano.current.findSceneById(currPanoId)) {
        marzipano.current.updateCurrView(
          viewParams,
          marzipano.current.findSceneById(currPanoId),
        );
      }
    }
  }

  /**
   * The main function to get survey nodes for a specific floor.
   * It resets the viewer and aborts any pending network calls before fetching and processing
   * survey nodes for the specified floor.
   * @param {number} [floor=0] - The floor number for which to fetch survey nodes. Defaults to 0.
   */
  function getSurveyNodes(floor: number = 0): void {
    if (floor !== Infinity) {
      resetViewerAndAbortCalls();
      fetchAndProcessSurveyNodes(floor);
    }
  }

  function changeDate(date: Date): void {
    setCurrDate(date);
  }

  async function changeDateAndUpdateFloors(date: Date): Promise<void> {
    if (date.toISOString() === currDate.toISOString()) return;
    changeDate(date);
    await updateFloors();
    updateAvailableFloors(floors);
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
      setMinimap(MinimapInitial);
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
      setMinimap(MinimapInitial);
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
    <div data-testid="site-element" id="sitePage">
      <TitleCard
        firstLineName={
          marzipano.current
            ? marzipano.current.findNameById(currPanoId)
            : config.display.title
        }
        timelineOpen={timelineOpen}
      />
      <div className="marzipano-info">
        <MarzipanoDisplayInfo viewParams={currViewParams} />
      </div>
      <div
        className={`linkButton ${!config.enable.hotspots_nav && "hide"}`}
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
          setNodeState={updateNodeState}
          currViewParams={currViewParams}
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
      {enableTimeline && (
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
          surveyWithFloors={surveys}
          siteSurveys={allSurveys}
          changeDateAndUpdateFloors={changeDateAndUpdateFloors}
        />
      )}
    </div>
  );
}

export default Site;
