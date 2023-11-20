import React, { useState, useRef, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import NetworkCalls from "../utils/NetworkCalls";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import SceneTitle from "./SceneTitle";
import JSZip from "jszip";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useSettingsContext } from "../context/SettingsContext";
import { MinimapReturn } from "./Site";

interface UploadFilesProp {
  siteId: string;
  mode: string;
  floor?: number | string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  fetchSettings?: Function;
  floorData?: MinimapReturn;
  setFloorExists?: (value: boolean) => void;
  timeline?: boolean;
}

/**
 * This component renders the upload marzipano zip and CSV file. It is also the parent component to Scene Title.
 * It takes in the siteId and a mode which specifies whether or not to render a static or dynamic Scene Title.
 */
const UploadFiles: React.FC<UploadFilesProp> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [zipFileInfo, setZIPFileInfo] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvFileInfo, setCSVFileInfo] = useState<any>();
  const [uploadFloor, setUploadFloor] = useState<number>();
  const [orphanRecordsInCSV, setOrphanRecordsInCSV] = useState<boolean>(false);
  const [errorInCsv, setErrorInCsv] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scenesDetails, setScenesDetails] = useState<any>();
  const [zipBorder, setZipBorder] = useState<boolean>(false);
  const [csvBorder, setCSVBorder] = useState<boolean>(false);
  // If 0: No boxes hovered. If 1: Upload Zip hovered. If 2: Upload CSV hovered.
  const [hovered, setHovered] = useState<number>(0);
  // If 0: No invalid boxes. If 1: Upload Zip invalid drop. If 2: Invalid CSV drop.
  const [invalidDrop, setInvalidDrop] = useState<number>(0);
  const [loadingSpinner, setLoadingSpinner] = useState<boolean>(false);
  const zipRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const messages = useIntl();
  const navigate = useNavigate();
  const [settings] = useSettingsContext();
  const [editTable] = useState<boolean>(false);

  useEffect(() => {
    // Gets the correct floor number from either props.floor or props.floorData which can both be undefined. If neither contains the floor number, then the floor number is set to -1 indicating that no floor has been uploaded to the server yet.
    if (props.floor !== undefined) {
      setUploadFloor(Number(props.floor));
    } else {
      if (
        props.floorData !== undefined &&
        props.floorData.floor !== -1 &&
        props.floorData !== null
      ) {
        setUploadFloor(props.floorData.floor);
      } else {
        setUploadFloor(-1);
      }
    }

    async function checkSite() {
      await NetworkCalls.getSurveyExistence(props.siteId).then((res) => {
        if (res) {
          if (res.sitePopulated === true && !settings?.enableMultiSite)
            !settings?.enableMultiSite
              ? navigate("/site")
              : navigate(`/site/${props.siteId}/site`);
        }
      });
    }

    if (props.floor === -1) checkSite();
  }, []);

  const uploadFiles = async () => {
    if (uploadFloor !== undefined) {
      try {
        await NetworkCalls.uploadScene(
          zipFileInfo,
          csvFileInfo,
          props.siteId,
          uploadFloor,
        );
        if (props.fetchSettings) props.fetchSettings();
      } catch (e) {
        window.alert(`Error! \n\n Failed to upload scene. \n ${e}`);
      } finally {
        setLoadingSpinner(false);
        if (props.setFloorExists) props.setFloorExists(true);
        !settings?.enableMultiSite
          ? navigate("/site")
          : navigate(`/site/${props.siteId}/site`);
      }
    }
  };

  // Function for returning a formatted file size. E.g. bytes to mbs.
  function returnFileSize(fileSize: number) {
    if (fileSize < 1024) {
      return fileSize + " bytes";
    } else if (fileSize >= 1024 && fileSize < 1048576) {
      return (fileSize / 1024).toFixed(1) + "kb";
    } else if (fileSize >= 1048576) {
      return (fileSize / 1048576).toFixed(1) + "mb";
    } else if (fileSize >= 1073741824) {
      return (fileSize / 1073741824).toFixed(1) + "GB";
    }
  }
  const validateUploads = () => {
    setErrorInCsv(false);
    setOrphanRecordsInCSV(false);

    const zip = new JSZip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zip.loadAsync(zipFileInfo).then(function (zip: { files: any }) {
      const files = zip.files;

      Papa.parse(csvFileInfo, {
        header: true,
        skipEmptyLines: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        complete: (results: any) => {
          const data = results.data;

          // Check scene from zip exists in csv file
          const regex = new RegExp(/(app-files\/tiles\/[^/]+\/)$/, "g");
          const matchedSites = Object.keys(files).filter((path: string) =>
            path.match(regex),
          );

          for (const element of matchedSites) {
            const fileName = element.split("/")[2].replace(/^[0-9]+-/, "");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const csvScene = data.filter(function (element: any) {
              return element.fileName == fileName;
            })[0];
            if (typeof csvScene === "undefined") {
              const nonFoundScene = {
                foundInCsv: false,
                fileName: fileName,
              };
              data.push(nonFoundScene);
              setErrorInCsv(true);
            } else {
              csvScene.foundInCsv = true;
            }
          }

          for (const element of data) {
            if (typeof element["foundInCsv"] != "undefined") {
              // Check scene coordinates correcteness in csv file
              if (
                typeof element["x"] === "undefined" ||
                typeof element["y"] === "undefined" ||
                element.x === "" ||
                element.y === ""
              ) {
                element.coordinatesOk = false;
                setErrorInCsv(true);
              } else {
                element.coordinatesOk = true;
              }
              element.isOrphan = false;
            } else {
              element.isOrphan = true;
              setOrphanRecordsInCSV(true);
            }

            if (!props.timeline) element.dateOk = true;
            else if (element.date) element.dateOk = true;
            else {
              element.dateOk = false;
              setErrorInCsv(true);
            }
          }

          setScenesDetails(data);
        },
      });
    });
  };

  useEffect(() => {
    if (zipFileInfo && csvFileInfo) validateUploads();
  }, [zipFileInfo, csvFileInfo]);

  const resetZipUpload = () => {
    setZIPFileInfo("");
    if (scenesDetails) setScenesDetails("");
    if (zipRef.current?.value) {
      zipRef.current.value = "";
    }
    setZipBorder(false);
  };

  const resetCsvUpload = () => {
    setCSVFileInfo("");
    if (scenesDetails) setScenesDetails("");
    if (csvRef.current?.value) {
      csvRef.current.value = "";
    }
    setCSVBorder(false);
  };

  return (
    <>
      <div
        className="upload"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <SceneTitle
          siteId={props.siteId}
          mode={props.mode}
          floor={uploadFloor}
        />
        <div className="uploadSection">
          <div className="newMarzipano">
            <form action="">
              <span>
                <label
                  htmlFor="uploadZip"
                  onDragLeave={() => setHovered(0)}
                  onDragOver={() => {
                    setHovered(1);
                  }}
                  onDrop={(e) => {
                    if (
                      e.dataTransfer.files[0] &&
                      e.dataTransfer.files[0].type === "application/zip"
                    ) {
                      setZIPFileInfo(e.dataTransfer.files[0]);
                      setZipBorder(true);
                    } else {
                      setInvalidDrop(1);
                      setTimeout(() => {
                        setInvalidDrop(0);
                      }, 300);
                      setZipBorder(false);
                    }
                    setHovered(0);
                  }}
                >
                  <div
                    className={`uploadField ${hovered === 1 && "hovered"} ${
                      invalidDrop === 1 && "invalid"
                    } ${zipBorder && "solid"}`}
                  >
                    <i className="uploadIcons fa-solid fa-file-zipper"></i>
                    <p>
                      {!zipFileInfo
                        ? messages.formatMessage({
                            id: "uploadMarzipanoZIP",
                          })
                        : zipFileInfo.name}
                    </p>
                    <p className="fileSize">
                      {zipFileInfo && `(${returnFileSize(zipFileInfo.size)})`}
                    </p>
                    <span className="formBtn">
                      {!zipFileInfo
                        ? messages.formatMessage({
                            id: "browse",
                          })
                        : messages.formatMessage({
                            id: "changeFile",
                          })}
                    </span>
                    {!zipFileInfo ? (
                      ""
                    ) : (
                      <label
                        className="cancelCross"
                        onClick={() => {
                          setTimeout(() => {
                            resetZipUpload();
                          }, 100);
                        }}
                      >
                        <i className="fa-solid fa-trash-can icon"></i>
                      </label>
                    )}
                  </div>
                </label>

                <label
                  htmlFor="uploadCSV"
                  onDragLeave={() => setHovered(0)}
                  onDragOver={() => {
                    setHovered(2);
                  }}
                  onDrop={(e) => {
                    if (
                      e.dataTransfer.files[0] &&
                      e.dataTransfer.files[0].type === "text/csv"
                    ) {
                      setCSVFileInfo(e.dataTransfer.files[0]);
                      setCSVBorder(true);
                    } else {
                      setInvalidDrop(2);
                      setTimeout(() => {
                        setInvalidDrop(0);
                      }, 300);
                      setCSVBorder(false);
                    }
                    setHovered(0);
                  }}
                >
                  <div
                    className={`uploadField ${hovered === 2 && "hovered"} ${
                      invalidDrop === 2 && "invalid"
                    }
                                        ${csvBorder && "solid"}`}
                  >
                    {!errorInCsv ? (
                      <i className="uploadIcons fa-solid fa-file-csv"></i>
                    ) : (
                      <i className="uploadIcons error fa-solid fa-triangle-exclamation"></i>
                    )}
                    <p>
                      {!csvFileInfo && !errorInCsv
                        ? messages.formatMessage({
                            id: "uploadCSVFile",
                          })
                        : errorInCsv
                          ? messages.formatMessage({
                              id: "CSVFileError",
                            })
                          : csvFileInfo.name}
                    </p>
                    <p className="fileSize">
                      {csvFileInfo && `(${returnFileSize(csvFileInfo.size)})`}
                    </p>
                    <span className="formBtn">
                      {!csvFileInfo
                        ? messages.formatMessage({
                            id: "browse",
                          })
                        : messages.formatMessage({
                            id: "changeFile",
                          })}
                    </span>
                    {!csvFileInfo ? (
                      ""
                    ) : (
                      <label
                        className="cancelCross"
                        onClick={() => {
                          setTimeout(() => {
                            resetCsvUpload();
                          }, 100);
                        }}
                      >
                        <i className="fa-solid fa-trash-can icon"></i>
                      </label>
                    )}
                  </div>
                </label>

                <input
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setZIPFileInfo(e.target.files?.[0]);
                      setZipBorder(true);
                    }
                  }}
                  ref={zipRef}
                  type="file"
                  name="uploadZip"
                  id="uploadZip"
                  accept=".zip"
                />
                <input
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setCSVFileInfo(e.target.files?.[0]);
                      setCSVBorder(true);
                    }
                  }}
                  ref={csvRef}
                  type="file"
                  name="uploadCSV"
                  id="uploadCSV"
                  accept=".csv"
                />
              </span>
            </form>

            {loadingSpinner && (
              <Box sx={{ width: "80%", marginTop: "2em" }}>
                <LinearProgress color="inherit" />
              </Box>
            )}
          </div>

          {orphanRecordsInCSV && (
            <p>{messages.formatMessage({ id: "orphansInCSV" })}</p>
          )}
          {scenesDetails && (
            <>
              {/* <span
                                className="edit-button"
                                onClick={() => setEditTable(!editTable)}
                            >
                                <i className="fa-solid fa-pencil" /> Edit
                            </span> */}
              <div className="validationTable">
                <table className="scene_properties">
                  <tr>
                    <th>Scene</th>
                    <th>X-Coordinate</th>
                    <th>Y-Coordinate</th>
                    <th>Name</th>
                    <th>Survey Date</th>
                    <th>Status</th>
                  </tr>
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    scenesDetails.map((row: any, index: number) => {
                      return (
                        <tr key={index}>
                          <td>{row.fileName}</td>
                          <td className={`centerCol ${row.x ? "" : "error"}`}>
                            {editTable ? (
                              <div>
                                <input
                                  type="number"
                                  defaultValue={row.x}
                                  onChange={(e) => {
                                    row.x = e.target.value;
                                  }}
                                />
                              </div>
                            ) : row.x ? (
                              row.x
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className={`centerCol ${row.y ? "" : "error"}`}>
                            {editTable ? (
                              <div>
                                <input
                                  type="number"
                                  defaultValue={row.y}
                                  onChange={(e) => {
                                    row.y = e.target.value;
                                  }}
                                />
                              </div>
                            ) : row.y ? (
                              row.y
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className={`${row.title ? "" : "error"}`}>
                            {editTable ? (
                              <div>
                                <input
                                  type="text"
                                  defaultValue={row.title}
                                  onChange={(e) => {
                                    row.title = e.target.value;
                                  }}
                                />
                              </div>
                            ) : row.title ? (
                              row.title
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className={`${row.date ? "" : "error"}`}>
                            {editTable ? (
                              <div>
                                <input
                                  type="date"
                                  defaultValue={row.date}
                                  onChange={(e) => {
                                    row.date = e.target.value;
                                  }}
                                />
                              </div>
                            ) : row.date ? (
                              row.date
                            ) : (
                              "-"
                            )}
                          </td>
                          {row.isOrphan ? (
                            <td className="centerCol error">
                              <i className="fa-solid fa-triangle-exclamation" />
                            </td>
                          ) : row.foundInCsv &&
                            row.coordinatesOk &&
                            row.dateOk ? (
                            <td className="centerCol allGood">
                              <i className="fa-solid fa-check" />
                            </td>
                          ) : (
                            <td className="centerCol error">
                              <i className="fa-solid fa-xmark" />
                            </td>
                          )}
                        </tr>
                      );
                    })
                  }
                </table>
              </div>
            </>
          )}
          <div className="buttonBox">
            <button
              className={`submitBtn formBtn ${
                !(
                  zipFileInfo &&
                  csvFileInfo &&
                  !errorInCsv &&
                  !loadingSpinner
                ) && "disabled"
              }`}
              onClick={() => {
                if (
                  zipFileInfo &&
                  csvFileInfo &&
                  !errorInCsv &&
                  !loadingSpinner
                ) {
                  setLoadingSpinner(true);
                  uploadFiles();
                }
              }}
            >
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
              <p>
                <FormattedMessage id="submit" />
              </p>
            </button>

            {/* Cancel button removed for now as it is unknown whether or not it will be needed in the future. */}
            {/* <button
                            className={`cancelBtn ${props.mode}`}
                            onClick={() => {
                                navigate(`/site/${props.siteId}/site`);
                            }}
                        >
                            <p>
                                <FormattedMessage id="cancel" />
                            </p>
                        </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadFiles;
