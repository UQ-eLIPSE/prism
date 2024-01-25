/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import MinimapStyles from "../sass/partials/_minimap.module.scss";
import { ISettings } from "../typings/settings";
import NetworkCalls from "../utils/NetworkCalls";
import { useUserContext } from "../context/UserContext";
import { InfoHotspot } from "../interfaces/NodeData";
import EditNodeForm from "./EditNodePositionForm";

interface NewNode {
  floor: number;
  node_number: number;
  site: string;
  survey_node: string;
  tiles_id: string;
  tiles_name: string;
  x: number;
  x_scale: number;
  y: number;
  y_scale: number;
  rotation: number;
  minimapShown?: boolean;
  info_hotspots: InfoHotspot[] | [];
}

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

function Minimap(props: Readonly<object> | any) {
  const config: ISettings = props.config;
  const [user] = useUserContext();
  const [mapHover, setMapHover] = useState<boolean>(false);

  // State for controlling minimap upload
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    props.minimapData,
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
  const [selectedNode, setSelectedNode] = useState<NewNode | null>();

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
          props.floor,
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
      setImageUrl(undefined);
    }
  }, [props.config.site, props.minimapData, props.nodeData, selectedNode]);

  useEffect(() => {
    if (props.minimapEnlarged === false) {
      setSelectedNode(null);
      setEditing(false);
    }
  }, [props.minimapEnlarged]);

  function handleNodeClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    node: NewNode,
  ): void {
    e.stopPropagation();

    if (editing && !selectedNode) {
      setSelectedNode(node);
      setX(
        (((!props.minimapData.xy_flipped ? node.x : node.y) +
          props.minimapData.x_pixel_offset) /
          props.minimapData.img_width) *
          100,
      );
      setY(
        (((!props.minimapData.xy_flipped ? node.y : node.x) +
          props.minimapData.y_pixel_offset) /
          props.minimapData.img_height) *
          100,
      );
      setRotation(Math.round(node.rotation * 57.2958) % 360);
    } else if (!editing && !selectedNode) {
      props.updateMinimapEnlarged(false);
      props.onClickNode(node.tiles_id);
    }
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
      return `rotate(${rotation / 57.2958}rad)`;
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
        let x_position: number =
          (props.minimapData.x_scale *
            ((!props.minimapData.xy_flipped ? node.x : node.y) +
              props.minimapData.x_pixel_offset) *
            100) /
          props.minimapData.img_width;
        let y_position: number =
          (props.minimapData.y_scale *
            ((!props.minimapData.xy_flipped ? node.y : node.x) +
              props.minimapData.y_pixel_offset) *
            100) /
          props.minimapData.img_height;

        // ERROR: This fails when an offset is used, broken logic!!
        //      let x_position: number = config.X_SCALE
        //        * (((!config.XY_FLIPPED ? node.xPixelOffset : node.yPixelOffset) / config.IMG_WIDTH) * 100
        //          + config.X_PIXEL_OFFSET);
        //      let y_position: number = config.Y_SCALE
        //        * (((!config.XY_FLIPPED ? node.yPixelOffset : node.xPixelOffset) / config.IMG_HEIGHT) * 100
        //          + config.Y_PIXEL_OFFSET);

        if (x_position > 100) {
          x_position = 95;
        } else if (x_position < 0) {
          x_position = 5;
        }
        if (y_position > 100) {
          y_position = 95;
        } else if (y_position < 0) {
          y_position = 5;
        }

        const isMapEnlarged = props.minimapEnlarged;
        // const isInfoNode = (node.info_hotspots?.length ?? 0) > 0;
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
                {/* Commented out as it may be needed with future infoNode functionality. */}
                {/* {isInfoNode && (
                  <div className={MinimapStyles.infoIcon}>
                    <i className="fas fa-info-circle" />
                  </div>
                )} */}
                {nodeTitle}
              </div>
            )}
          </div>
        );
      },
    );
  }

  async function updateNodeInfo() {
    try {
      const newX: number =
        (props.minimapData.img_width * x) / 100 -
        props.minimapData.x_pixel_offset;
      const newY: number =
        (props.minimapData.img_height * y) / 100 -
        props.minimapData.y_pixel_offset;

      await NetworkCalls.updateNodeCoordinates(
        // Converts x and y percentage coordinates to pixel coordinates in relation to image height and width.
        // I.e., x = 50 means 50% from left, therefore, 50% of image width since 50 / 100 = 0.5.

        selectedNode?.survey_node,
        newX,
        newY,
      );
    } catch (e) {
      window.alert(`Error! \n\n Failed to Update Node Coordinates \n ${e}`);
    }

    try {
      await NetworkCalls.updateNodeRotation(
        // Dividing rotation by 57.2958 will convert it from degrees (0 - 360) to radians to be stored in the db.

        selectedNode?.survey_node,
        rotation / 57.2958,
      );
    } catch (e) {
      window.alert(`Error! \n\n Failed to Update Node Rotation \n ${e}`);
    }
  }

  // Update floor name and tag in database
  async function updateNames() {
    if (!floorTag) setFloorTag(props.minimapData.floor);
    if (!floorName) setFloorName(`Floor ${props.minimapData.floor}`);

    try {
      const call = await NetworkCalls.updateMinimapNames(
        props.minimapData.floor,
        props.siteId,
        floorTag,
        floorName,
      );
      if (call.success === true) {
        setSubmitVisibility(false);
      }

      props.updateFloorTag(floorTag);
    } catch (e) {
      window.alert(`Error! \n\n Failed to Update Floor Details \n ${e}`);
    }
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
            setSelectedNode(null);

            if (editing && selectedNode) {
              updateNodeInfo();
              setSelectedNode(null);
              setEditing(false);
            }
          }}
          className={`editButton ${
            editing && !selectedNode
              ? "selecting"
              : editing && selectedNode
                ? "editing"
                : ""
          }`}
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
              <div className="submit-update" onClick={() => updateNames()}>
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
                      props.minimapData ? props.minimapData.image : undefined,
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
