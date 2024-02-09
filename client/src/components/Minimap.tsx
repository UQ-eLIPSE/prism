import React, { useEffect, useState } from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import { ISettings } from "../typings/settings";
import NetworkCalls from "../utils/NetworkCalls";
import { useUserContext } from "../context/UserContext";
import EditNodeForm from "./EditNodePositionForm";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import MinimapUtils from "../utils/MinimapUtils";
import { FloorIdentifier } from "../interfaces/MiniMap/FloorIdentifier";
import { MinimapConstants } from "../utils/MinimapConstants.d";
import NodeCollection from "./NodeCollection";
import FloorDetailsForm from "./FloorDetailsForm";
import ToggleEditNodeButton from "./ToggleEditNodeButton";
import MinimapImage from "./MiniMapImage";
import SubmitOrCancelOptions from "./SubmitOrCancelOptions";

/**
 * This interface represents the current node's position and rotation in the minimap.
 * It is used to update the node's position and rotation in the database.
 * @interface NodeConfiguration
 * @property {number} x_position 0 - 100 horizontal percentage position of the node.
 * @property {number} y_position 0 - 100 vertical percentage position of the node.
 * @property {number} rotation 0 - 360 degrees rotation of the node.
 */
interface NodeConfiguration {
  x_position: number;
  y_position: number;
  rotation: number;
}

function Minimap(props: MinimapProps) {
  const config: ISettings = props.config;
  const [user] = useUserContext();
  const [mapHover, setMapHover] = useState<boolean>(false);

  // State for controlling minimap upload
  const [imageUrl, setImageUrl] = useState<string>(
    props.minimapData ? props.minimapData.image_url : "",
  );
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  // State for controlling minimap renaming
  const [floorName, setFloorName] = useState<string>("");
  const [floorTag, setFloorTag] = useState<string>("");

  // State for submit button visibility
  const [submitVisibility, setSubmitVisibility] = useState<boolean>(false);

  // State for controlling editing of node position and rotation.
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<NewNode | null>(null);

  const [rotation, setRotation] = useState<number>(0);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  // * temporary
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodeState, setNodeState] = useState<NodeConfiguration>({
    x_position: 0,
    y_position: 0,
    rotation: 0,
  });

  const [nodes, editNodes] = useState<NewNode[]>([]);
  const payload = selectedNode ? [...nodes, selectedNode] : nodes;

  useEffect(() => {
    const getMinimapNodes = async () => {
      try {
        const minimapNodeData = await NetworkCalls.getMinimapNodeInformation(
          props.config.site,
          String(props.floor),
          props.currDate,
        );

        if (minimapNodeData) {
          editNodes(
            selectedNode
              ? minimapNodeData.filter(
                  (nodeListItem: NewNode) =>
                    nodeListItem.survey_node !== selectedNode?.survey_node,
                )
              : minimapNodeData,
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (props.minimapData && props.minimapData.image_url) {
      getMinimapNodes();
      setFloorName(props.minimapData.floor_name);
      setFloorTag(props.minimapData.floor_tag);
      setImageUrl(props.minimapData.image_url);
    } else {
      editNodes([]);
      setFloorName("");
      setFloorTag("");
      setImageUrl("");
    }
  }, [props.config.site, props.minimapData, props.nodeData, selectedNode]);

  useEffect(() => {
    if (!props.minimapEnlarged) {
      resetSelectedNode();
    }
  }, [props.minimapEnlarged]);

  function handleNodeClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    node: NewNode,
  ): void {
    e.stopPropagation();

    if (editing && !selectedNode) {
      MinimapUtils.setNodeSelected(
        node,
        props.minimapData,
        setSelectedNode,
        setX,
        setY,
        setRotation,
      );
    } else if (!editing && !selectedNode) {
      props.updateMinimapEnlarged(false);
      props.onClickNode(node.tiles_id);
    }
  }

  async function performMinimapUpload(): Promise<void> {
    try {
      await NetworkCalls.updateMinimapImage(
        selectedImage,
        props.siteId,
        props.floor,
      );
      setPendingUpload(false);
    } catch (e) {
      window.alert(`Error! \n\n Failed to upload minimap image. \n ${e}`);
    }
  }

  function configureRotation(node: NewNode): string {
    if (!config.enable.rotation) {
      return "";
    }

    if (node == selectedNode) {
      return `rotate(${rotation / MinimapConstants.DEGREES_TO_RADIANS_ROTATION}rad)`;
    } else {
      const numOr0 = (n: number) => (isNaN(n) ? 0 : n);
      const sum = [
        props.currRotation,
        config.initial_settings.rotation_offset,
        node.rotation,
      ].reduce((a, b) => numOr0(a) + numOr0(b));
      return `rotate(${sum}rad)`;
    }
  }

  async function updateNodeInfo(): Promise<void> {
    const newX: number = MinimapUtils.calculateNewXY(
      props.minimapData.img_width,
      x,
      props.minimapData.x_pixel_offset,
      props.minimapData.x_scale,
    );
    const newY: number = MinimapUtils.calculateNewXY(
      props.minimapData.img_height,
      y,
      props.minimapData.y_pixel_offset,
      props.minimapData.y_scale,
    );

    await MinimapUtils.updateNodeCoordinateAPI(
      selectedNode,
      newX,
      newY,
      "Error! \n\n Failed to Update Node Coordinates \n",
    );

    await MinimapUtils.updateNodeRotationAPI(
      selectedNode,
      rotation,
      "Error! \n\n Failed to Update Node Rotation",
    );

    resetSelectedNode(); // reset selected node and toggle edit state to false
  }

  // Update floor name and tag in database
  async function updateFloorTagAndName() {
    if (!floorTag) setFloorTag(String(props.minimapData.floor));
    if (!floorName) setFloorName(`Floor ${props.minimapData.floor}`);

    const floorInfo: FloorIdentifier = {
      floorName,
      floorTag,
    };

    const updateSuccess: boolean = await MinimapUtils.updateFloorTagAndNameAPI(
      props.minimapData.floor,
      props.siteId,
      floorInfo,
      "Error! \n\n Failed to Update Floor Details \n",
    );

    updateSuccess && setSubmitVisibility(false); // hide form if update is successful

    props.updateFloorTag(floorTag);
  }

  /**
   * Clears selected node and force toggle edit state to false.
   */
  function resetSelectedNode(): void {
    setSelectedNode(null);
    setEditing(false);
  }

  return (
    <>
      {editing && !selectedNode && (
        <div className="instructions site-title">
          <i className="fa-solid fa-arrow-pointer"></i>
          <h2>Select a Node to Edit</h2>
        </div>
      )}

      <div
        className={`minimapControls ${
          props.minimapEnlarged && user?.isAdmin ? "visible" : ""
        }`}
      >
        <ToggleEditNodeButton
          isEditingState={{ value: editing, setFn: setEditing }}
          selectedNodeState={{ value: selectedNode, setFn: setSelectedNode }}
          updateNodeInfo={updateNodeInfo}
        />

        <div className={`controls ${selectedNode && editing ? "visible" : ""}`}>
          <p className="nodeEditTitle">{selectedNode?.tiles_name}</p>
          <EditNodeForm
            rotationState={{ value: rotation, setFn: setRotation }}
            xPositionState={{ value: x, setFn: setX }}
            yPositionState={{ value: y, setFn: setY }}
            resetSelectedNode={resetSelectedNode}
            updateNode={updateNodeInfo}
          />
        </div>
      </div>

      <div
        className={`entireMinimap ${classNames(MinimapStyles.miniMapContainer, {
          [MinimapStyles.sideNavOpen]: props.sideNavOpened,
        })}`}
        data-cy="mini-map"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <FloorDetailsForm
          showForm={
            !props.minimapEnlarged && props.minimapData && user?.isAdmin
          }
          minimapShown={props.minimapShown}
          minimapData={{
            floor_tag: props.minimapData.floor_tag,
            floor_name: props.minimapData.floor_name,
          }}
          floorNameState={{ value: floorName, setFn: setFloorName }}
          floorTagState={{ value: floorTag, setFn: setFloorTag }}
          submitVisibilityState={{
            value: submitVisibility,
            setFn: setSubmitVisibility,
          }}
          handleUpdateFloorTagAndName={updateFloorTagAndName}
        />

        {props.minimapShown && (
          <>
            <div
              className={classNames({
                [MinimapStyles.largeMap]: props.minimapEnlarged,
                [MinimapStyles.smallMap]: !props.minimapEnlarged,
              })}
              onClick={(): void => {
                props.linkNodeFunction(false);
              }}
              onMouseOver={(): void => setMapHover(true)}
              onMouseOut={(): void => setMapHover(false)}
              data-cy={
                props.minimapEnlarged ? "minimap-large" : "minimap-small"
              }
            >
              {imageUrl && props.minimapData && (
                <button
                  className={
                    props.minimapEnlarged
                      ? MinimapStyles.openShow
                      : MinimapStyles.closeShow
                  }
                  onClick={(): void => {
                    props.updateMinimapEnlarged(!props.minimapEnlarged);
                  }}
                >
                  <i
                    className={
                      props.minimapEnlarged
                        ? "fas fa-window-close"
                        : "fas fa-expand-arrows-alt"
                    }
                  />
                </button>
              )}
              {imageUrl ? (
                <MinimapImage
                  mapHoverStyleCondition={!mapHover}
                  imageUrl={imageUrl}
                  imageAlt="Facility Minimap"
                  imageStyle={{
                    display: !props.minimapEnlarged ? "block" : "none",
                  }}
                  additionalImgClasses="small-map-img"
                  handleOnClick={(): void => {
                    props.updateMinimapEnlarged(!props.minimapEnlarged);
                  }}
                />
              ) : (
                <div
                  className="minimap-drag-drop"
                  onDragOver={() => setMapHover(true)}
                  onDragLeave={(e) => {
                    if (e.target instanceof HTMLDivElement) {
                      setMapHover(false);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMapHover(false);
                    if (
                      e.dataTransfer.files[0] &&
                      e.dataTransfer.files[0].type.includes("image/")
                    ) {
                      setSelectedImage(e.dataTransfer.files[0]);
                      setImageUrl(URL.createObjectURL(e.dataTransfer.files[0]));
                      setPendingUpload(true);
                    }
                  }}
                >
                  <label
                    className={
                      mapHover
                        ? "displayed light dropUpload"
                        : `${
                            !imageUrl || !props.minimapData
                              ? "displayed"
                              : "light"
                          }`
                    }
                    htmlFor="select-image"
                  >
                    <span className={`${mapHover && "dropUploadHover"}`}>
                      <i
                        className={`fa-solid ${
                          mapHover ? "fa-cloud-arrow-up" : "fa-file-image"
                        }`}
                      ></i>
                      <p>
                        {mapHover
                          ? "Drop Image to Upload"
                          : "Upload Minimap Image"}
                      </p>
                    </span>
                  </label>
                </div>
              )}

              {props.minimapData && imageUrl && (
                <MinimapImage
                  mapHoverStyleCondition={mapHover}
                  imageUrl={imageUrl}
                  imageAlt="Facility Minimap with Index"
                  imageStyle={{
                    display: props.minimapEnlarged ? "block" : "none",
                  }}
                />
              )}
              {props.minimapData && (
                <NodeCollection
                  renderData={payload}
                  selectedNode={selectedNode}
                  MinimapProps={props}
                  configureRotation={configureRotation}
                  x={x}
                  y={y}
                  handleNodeClick={handleNodeClick}
                />
              )}
            </div>

            <div className="minimapButtons">
              {!pendingUpload && !props.minimapEnlarged && user?.isAdmin && (
                <div
                  className={
                    props.floor ? "upload-update" : " upload-update no-floor"
                  }
                >
                  <input
                    accept="image/*"
                    type="file"
                    id="select-image"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedImage(e.target.files[0]);
                        setImageUrl(URL.createObjectURL(e.target.files[0]));
                        setPendingUpload(true);
                      }
                    }}
                  />
                  <label
                    htmlFor="select-image"
                    data-cy="upload-minimap-img-label"
                  >
                    {imageUrl ? "Update" : "Upload"} Minimap
                  </label>
                </div>
              )}
              <SubmitOrCancelOptions
                showCondition={
                  pendingUpload && !props.minimapEnlarged && user?.isAdmin
                }
                handleSubmit={performMinimapUpload}
                handleCancel={() => {
                  setSelectedImage(undefined);
                  setImageUrl(props.minimapData ? props.minimapData.image : "");
                  setPendingUpload(false);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Minimap;
