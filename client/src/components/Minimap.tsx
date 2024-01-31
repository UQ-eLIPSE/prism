import React, { useEffect, useState } from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import { ISettings } from "../typings/settings";
import NetworkCalls from "../utils/NetworkCalls";
import { useUserContext } from "../context/UserContext";
import EditNodeForm from "./EditNodePositionForm";
import { MinimapProps } from "../interfaces/MiniMap/MinimapProps";
import { NewNode } from "../interfaces/MiniMap/NewNode";
import MinimapUtils, {
  FloorIdentifier,
  MinimapConstants,
} from "../utils/MinimapUtils";

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
    if (props.minimapEnlarged === false) {
      resetSelectedNode();
    }
  }, [props.minimapEnlarged]);

  function handleNodeClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    node: NewNode,
  ): void {
    e.stopPropagation();

    MinimapUtils.setNodeSelected(
      editing,
      selectedNode,
      node,
      props.minimapData,
      setSelectedNode,
      setX,
      setY,
      setRotation,
      props.updateMinimapEnlarged,
      props.onClickNode,
    );
  }

  async function performMinimapUpload() {
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

  function getNodesJSX(nodeData: NewNode[]): React.ReactElement[] {
    return (selectedNode ? [...nodeData, selectedNode] : nodeData).map(
      (node, index) => {
        // Element Position = Scale * (Position within map + Offset)
        const scaledCoordinates = MinimapUtils.getScaledNodeCoordinates(
          props.minimapData,
          node,
        );

        function adjustPosition(position: number) {
          if (position > MinimapConstants.UPPER_BOUND) {
            return MinimapConstants.UPPER_ADJUST;
          } else if (position < MinimapConstants.LOWER_BOUND) {
            return MinimapConstants.LOWER_ADJUST;
          }
          return position;
        }

        const x_position: number = adjustPosition(
          scaledCoordinates.nodeXScaledCoordinate,
        );
        const y_position: number = adjustPosition(
          scaledCoordinates.nodeYScaledCoordinate,
        );

        const isMapEnlarged = props.minimapEnlarged;
        const nodeTitle = node.tiles_name;

        return (
          <div
            key={index}
            className={node == selectedNode ? "currentSelectedNode" : ""}
          >
            <div
              className={MinimapStyles.nodeContainer}
              style={{
                top: `${node == selectedNode ? y : y_position}%`,
                left: `${node == selectedNode ? x : x_position}%`,
                transform: configureRotation(node),
              }}
              key={node.tiles_id}
            >
              {node.tiles_id === props.currPanoId && config.enable.rotation && (
                <div className="positionIndicator" />
              )}

              {node == selectedNode && (
                <div className="positionIndicator selected" />
              )}

              <div
                className={classNames(MinimapStyles.node, {
                  [MinimapStyles.selectedNode]:
                    node.tiles_id === props.currPanoId,
                  [MinimapStyles.unselectedNode]:
                    node.tiles_id !== props.currPanoId,
                  [MinimapStyles.upscaled]: props.minimapEnlarged,
                  [MinimapStyles.scaled]: !props.minimapEnlarged,
                  [MinimapStyles.infoNode]: node.info_hotspots?.length ?? 0, //!!! Removed as it may be needed later with other infoNode functionality.
                })}
                key={node.tiles_id}
                id={node.tiles_id}
                onClick={(e): void => handleNodeClick(e, node)}
                data-cy={
                  node.tiles_id === props.currPanoId ? "selected-node" : "node"
                }
              />
            </div>
            {isMapEnlarged && (
              <div
                className={MinimapStyles.nodeTitle}
                style={{
                  top: `${node == selectedNode ? y : y_position}%`,
                  left: `${node == selectedNode ? x : x_position}%`,
                }}
              >
                {nodeTitle}
              </div>
            )}
          </div>
        );
      },
    );
  }

  async function updateNodeInfo() {
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

    resetSelectedNode();
  }

  // Update floor name and tag in database
  async function updateFloorTagAndName() {
    if (!floorTag) setFloorTag(String(props.minimapData.floor));
    if (!floorName) setFloorName(`Floor ${props.minimapData.floor}`);

    const floorInfo: FloorIdentifier = {
      floorName,
      floorTag,
    };

    const success = await MinimapUtils.updateFloorTagAndNameAPI(
      props.minimapData.floor,
      props.siteId,
      floorInfo,
      "Error! \n\n Failed to Update Floor Details \n",
    );

    success && setSubmitVisibility(false);

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
        <button
          onClick={(): void => {
            setEditing((editing) => !editing);

            if (!editing) setSelectedNode(null);

            if (editing && selectedNode) {
              updateNodeInfo();
            }
          }}
          className={`editButton ${
            editing && !selectedNode
              ? "selecting"
              : editing && selectedNode
                ? "editing"
                : ""
          }`}
          data-cy="edit-save-button"
        >
          <i
            className={`fa-solid ${
              editing && selectedNode ? "fa-floppy-disk" : "fa-pen-to-square"
            }`}
          ></i>

          <p>{`${editing && selectedNode ? "Save" : "Edit"} Node`}</p>
        </button>

        <div className={`controls ${selectedNode && editing ? "visible" : ""}`}>
          <p className="nodeEditTitle">{selectedNode?.tiles_name}</p>
          <EditNodeForm
            rotationValue={rotation}
            setRotationValue={setRotation}
            xPositionValue={x}
            setXPositionValue={setX}
            yPositionValue={y}
            setYPositionValue={setY}
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
        {!props.minimapEnlarged && props.minimapData && user?.isAdmin && (
          <>
            <span className="inlineLabels">
              <div className="nameInput">
                <span>
                  {!props.minimapShown && <p>Floor Name</p>}
                  <input
                    value={floorName}
                    data-cy="floor-name-input"
                    onChange={(e) => {
                      setFloorName(e.target.value);
                      if (
                        ((!props.minimapData || !props.minimapData.floor_tag) &&
                          e.target.value) ||
                        (floorTag &&
                          e.target.value &&
                          props.minimapData &&
                          (floorTag != props.minimapData.floor_tag ||
                            e.target.value !== props.minimapData.floor_name))
                      ) {
                        setSubmitVisibility(true);
                      } else {
                        setSubmitVisibility(false);
                      }
                    }}
                  ></input>
                </span>

                <span>
                  {!props.minimapShown && <p>Tag</p>}
                  <input
                    value={floorTag}
                    data-cy="floor-tag-input"
                    onChange={(e) => {
                      if (e.target.value.length < 3) {
                        setFloorTag(e.target.value);
                        if (
                          ((!props.minimapData ||
                            !props.minimapData.floor_name) &&
                            e.target.value) ||
                          (e.target.value &&
                            floorName &&
                            props.minimapData &&
                            (e.target.value != props.minimapData.floor_tag ||
                              floorName !== props.minimapData.floor_name))
                        ) {
                          setSubmitVisibility(true);
                        } else {
                          setSubmitVisibility(false);
                        }
                      }
                    }}
                  ></input>
                </span>
              </div>
            </span>

            {submitVisibility && (
              <div
                className="submit-update"
                onClick={() => updateFloorTagAndName()}
              >
                <span>Save</span>
              </div>
            )}
          </>
        )}

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
                <img
                  className={classNames(
                    "small-map-img",
                    MinimapStyles.minimapImage,
                    MinimapStyles.smallMapImg,
                    {
                      [MinimapStyles.minimapImgHover]: !mapHover,
                    },
                  )}
                  onClick={(): void => {
                    props.updateMinimapEnlarged(!props.minimapEnlarged);
                  }}
                  src={imageUrl}
                  alt="Facility Minimap"
                  style={{
                    display: !props.minimapEnlarged ? "block" : "none",
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
                <img
                  className={classNames(
                    MinimapStyles.minimapImage,
                    MinimapStyles.largeMapImg,
                    {
                      [MinimapStyles.minimapImgHover]: mapHover,
                    },
                  )}
                  src={imageUrl}
                  alt="Facility Minimap with Index"
                  style={{
                    display: props.minimapEnlarged ? "block" : "none",
                  }}
                />
              )}
              {props.minimapData && getNodesJSX(nodes)}
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
              {pendingUpload && !props.minimapEnlarged && user?.isAdmin && (
                <div
                  className="submit-update"
                  onClick={() => {
                    performMinimapUpload();
                  }}
                >
                  <span>Submit</span>
                </div>
              )}
              {pendingUpload && !props.minimapEnlarged && user?.isAdmin && (
                <div
                  className="cancel-update"
                  onClick={() => {
                    setSelectedImage(undefined);
                    setImageUrl(
                      props.minimapData ? props.minimapData.image : "",
                    );
                    setPendingUpload(false);
                  }}
                >
                  <span>Cancel</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Minimap;
