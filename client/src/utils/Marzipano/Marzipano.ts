// todo fix the Function type and any calls in this file
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// Modified from Marzipano 0.9.1.

import * as Marzipano from "marzipano";
import { ISettings } from "../../typings/settings";
import {
  NodeData,
  LinkHotspot,
  InfoHotspot,
  InitialViewParameters,
  SurveyNode,
} from "../../interfaces/NodeData";
// Todo find scene and view type, remove any
interface IScene {
  data: NodeData;
  scene: any;
  view: any;
}

export default class MarzipanoHelper {
  public sceneElements: NodeListOf<Element>;
  private updateCurrPano: Function;
  private getInfoHotspot: Function;
  public data: NodeData[];
  public scenes: IScene[];
  public viewer: any;
  public updateRotation: Function;
  private updateViewParams: Function;
  private changeInfoPanelOpen: Function;

  constructor(
    data: NodeData[],
    getInfoHotspot: Function,
    updateCurrPano: Function,
    updateRotation: Function,
    updateViewParams: Function,
    changeInfoPanelOpen: Function,
    config: ISettings,
  ) {
    this.data = data;

    // Detect whether we are on a touch device.
    document.body.classList.add("no-touch");
    window.addEventListener("touchstart", function () {
      document.body.classList.remove("no-touch");
      document.body.classList.add("touch");
    });

    // Grab elements from DOM.
    const panoElement = document.querySelector("#pano");
    this.sceneElements = document.querySelectorAll("#sceneList .scene");
    this.getInfoHotspot = getInfoHotspot;
    this.updateCurrPano = updateCurrPano;
    this.updateRotation = updateRotation;
    this.updateViewParams = updateViewParams;
    this.changeInfoPanelOpen = changeInfoPanelOpen;

    const mouseViewMode = config.marzipano_mouse_view_mode;

    // Viewer options.
    const viewerOpts = {
      controls: {
        mouseViewMode: mouseViewMode,
      },
    };

    // Initialize viewer.
    this.viewer = new Marzipano.Viewer(panoElement, viewerOpts);
    if (config.enable.rotation) {
      this.viewer.addEventListener("viewChange", () => {
        this.updateRotation(this.viewer.view()._yaw);
        this.updateViewParams({
          yaw: this.viewer.view()._yaw,
          pitch: this.viewer.view()._pitch,
          fov: this.viewer.view()._fov,
        });
      });
    }
    // Initialize scenes with null values for scene and view.
    this.scenes = this.data.map((nodeData) => ({
      data: nodeData,
      scene: null,
      view: null,
    }));
  }

  private loadScene(index: number): void {
    const nodeData = this.scenes[index].data;
    const geometry = new Marzipano.CubeGeometry(nodeData.survey_node.levels);
    //Marzipano.RectilinearView.limit.traditional function, which sets limits on the field of view (FOV) for the rectilinear view in a Marzipano panorama:
    const limiter = Marzipano.RectilinearView.limit.traditional(
      //(100 * Math.PI) / 180: This is a conversion from degrees to radians.
      //(120 * Math.PI) / 180: This parameter sets the maximum FOV limit in radians.
      nodeData.survey_node.face_size,
      (100 * Math.PI) / 180,
      (120 * Math.PI) / 180,
    );
    const view = new Marzipano.RectilinearView(
      nodeData.survey_node.initial_parameters,
      limiter,
    );

    const scene = this.viewer.createScene({
      source: Marzipano.ImageUrlSource.fromString(
        nodeData.survey_node.manta_link +
          nodeData.minimap_node.tiles_id +
          "/{z}/{f}/{y}/{x}.jpg",
        {
          cubeMapPreviewUrl:
            nodeData.survey_node.manta_link +
            nodeData.minimap_node.tiles_id +
            "/preview.jpg",
        },
      ),
      geometry: geometry,
      view: view,
      pinFirstLevel: true,
    });

    // Create link hotspots.
    nodeData.survey_node.link_hotspots.forEach((hotspot) => {
      const element = this.createLinkHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, {
        yaw: hotspot.yaw,
        pitch: hotspot.pitch,
      });
    });

    // Create info hotspots.
    nodeData.survey_node.info_hotspots.forEach((hotspot) => {
      const element = this.createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, {
        yaw: hotspot.yaw,
        pitch: hotspot.pitch,
      });
    });

    this.scenes[index].scene = scene;
    this.scenes[index].view = view;
  }

  public async switchScene(sceneData: IScene | undefined): Promise<void> {
    //ToDO remove undefined type
    if (!sceneData) {
      console.error("Scene data is undefined");
      return;
    }
    const sceneIndex = this.scenes.findIndex((s) => s === sceneData);
    if (sceneIndex === -1) {
      console.error("Scene not found");
      return;
    }

    if (!sceneData.scene) {
      this.loadScene(sceneIndex);
    }
    this.changeInfoPanelOpen(false);
    sceneData.view.setParameters(sceneData.data.survey_node.initial_parameters);
    sceneData.scene.switchTo();

    this.updateCurrPano(sceneData.data.minimap_node.tiles_id);
    this.updateSceneList(sceneData);
    // todo: remove any, find scene type
    function waitForSceneLoaded(scene: any): Promise<void> {
      return new Promise((resolve) => {
        scene.addEventListener("loaded", () => resolve());
      });
    }
    // Usage within an async function
    async function updateMarzipanoContainerAfterSceneLoad(scene: any) {
      await waitForSceneLoaded(scene); // Wait for the scene to load

      const marzipanoContainer = document.getElementById("pano");
      if (marzipanoContainer) {
        const requiredCanvas = Array.from(
          marzipanoContainer.querySelectorAll("canvas"),
        ).slice(-2);
        const requiredDiv = Array.from(
          marzipanoContainer.querySelectorAll(":scope > div"),
        ).slice(-2);

        // Clean up
        marzipanoContainer.childNodes.forEach((node) => node.remove());

        // Add the required elements back
        if (requiredCanvas && requiredDiv) {
          marzipanoContainer.append(...requiredCanvas, ...requiredDiv);
        }
      }
    }
    await updateMarzipanoContainerAfterSceneLoad(sceneData.scene);
  }

  private updateSceneList(scene: any): void {
    for (let i = 0; i < this.sceneElements.length; i++) {
      const el = this.sceneElements[i];
      if (el.getAttribute("data-id") === scene.data.id) {
        el.classList.add("current");
      } else {
        el.classList.remove("current");
      }
    }
  }

  private createLinkHotspotElement(hotspot: LinkHotspot): HTMLDivElement {
    // Create wrapper element to hold icon and tooltip.
    const wrapper = document.createElement("div");
    wrapper.classList.add("hotspot");
    wrapper.classList.add("link-hotspot");

    // Create image element.
    const icon = document.createElement("img");
    icon.src = "/img/link.png";
    icon.classList.add("link-hotspot-icon");

    // Add click event handler.
    wrapper.addEventListener("click", () => {
      this.switchScene(this.findSceneById(hotspot.target));
    });

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    this.stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    const tooltip = document.createElement("div");
    tooltip.classList.add("hotspot-tooltip");
    tooltip.classList.add("link-hotspot-tooltip");

    const targetScene = this.findSceneDataById(hotspot.target);
    if (!targetScene) throw new Error("Could not find scene");
    tooltip.innerHTML = targetScene.survey_node.tiles_name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  private createInfoHotspotElement(hotspot: InfoHotspot): HTMLDivElement {
    // Create wrapper element to hold icon and tooltip.
    const wrapper = document.createElement("div");
    wrapper.onclick = (): void => {
      this.getInfoHotspot(hotspot.info_id);
    };
    wrapper.classList.add("hotspot");
    wrapper.classList.add("info-hotspot");

    // Create hotspot/tooltip header.
    const header = document.createElement("div");
    header.classList.add("info-hotspot-header");
    header.classList.add("tests");

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    // wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    const modal = document.createElement("div");
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add("info-hotspot-modal");
    document.body.appendChild(modal);

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    this.stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  // Prevent touch and scroll events from reaching the parent element.
  private stopTouchAndScrollEventPropagation(element: any): void {
    const eventList = [
      "touchstart",
      "touchmove",
      "touchend",
      "touchcancel",
      "wheel",
      "mousewheel",
    ];
    for (let i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function (event: any) {
        event.stopPropagation();
      });
    }
  }

  public findSceneById(id: string): IScene | undefined {
    return (this.scenes || []).find((s) => s.data.survey_node.tiles_id === id);
  }

  public findSceneDataById(id: string): NodeData | undefined {
    return (this.data || []).find((s) => s.survey_node.tiles_id === id);
  }

  public findNameById(id: string): string | undefined {
    return (this.data || []).find((s) => s.survey_node.tiles_id === id)
      ?.survey_node?.tiles_name;
  }

  public findLinkNodesById(id: string): SurveyNode[] | undefined {
    // Find link hotspots via given id and check exists
    const linkHotspotTargets: LinkHotspot[] = this.data.find(
      (s) => s.survey_node.tiles_id === id,
    )!.survey_node.link_hotspots!;
    if (!linkHotspotTargets) throw new Error("Could not find link hotspots.");

    // From hotspot array, find corrosponding survey nodes and check exists
    const surveyHotspots: any = (linkHotspotTargets || []).map(
      ({ target }) => this.findSceneDataById(target)?.survey_node,
    );
    if (!surveyHotspots) throw new Error("Could not find survey nodes.");

    // Return array of survey nodes
    return surveyHotspots;
  }

  public findInfoNodesById(id: string): InfoHotspot[] | undefined {
    // Find info hotspots via given id and check exists
    const infoHotspotTargets: InfoHotspot[] | undefined = (
      this.data || []
    ).find((s) => s.survey_node.tiles_id === id)?.survey_node?.info_hotspots;
    if (!infoHotspotTargets) throw new Error("Could not find info hotspots.");
    // Return array of survey nodes
    return infoHotspotTargets;
  }

  public updateCurrView(params: InitialViewParameters, scene: any): void {
    scene.view.setParameters(params);
  }

  public panUpdateCurrView(params: InitialViewParameters, scene: any): void {
    // Add 1.5 second transition period
    const options = {
      transitionDuration: 1500,
    };

    // Look to a specific scene given a set of params and options (transitionDuration)
    scene.scene.lookTo(params, options);
  }
}
