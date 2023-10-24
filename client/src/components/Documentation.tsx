// todo: change any types into proper types
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

// Material UI Components
import Grid from "@material-ui/core/Grid";
import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@material-ui/core";

// Styling
import DocumentationStyles from "../sass/partials/_documentation.module.scss";
import classNames from "classnames";
import NetworkCalls from "../utils/NetworkCalls";
import { ISettings } from "../typings/settings";

interface fileInfo {
  url: string;
  name: string;
}

interface folderInfo {
  id: string;
  name: string;
}

interface Props {
  config: ISettings;
  siteId: string;
}
export default function Documentation(props: Props) {
  const [originalFiles, setOriginalFiles] = useState<fileInfo[]>([]);
  const [files, setFiles] = useState<fileInfo[]>([]);
  const [fileView, setFileView] = useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<folderInfo[]>([]);
  const [parent, setParent] = useState<folderInfo>({
    id: "",
    name: "",
  });
  const [subDirectories, setSubDirectories] = useState<folderInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [allFiles, setAllFiles] = useState<fileInfo[]>([]);

  const abortController = new AbortController();

  // Error from fetchDirectory() call pending on further testing
  useEffect(() => {
    fetchDirectory();
    fetchAllFiles();
  }, []);

  async function fetchFiles(id: string): Promise<void> {
    try {
      const res: any = await NetworkCalls.fetchFiles(
        id,
        props.siteId,
        abortController,
      );
      const file: fileInfo = {
        url: res.url,
        name: res.name,
      };
      setFiles((files) =>
        [...files, file].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setOriginalFiles((files) =>
        [...files, file].sort((a, b) => a.name.localeCompare(b.name)),
      );
    } catch (e) {
      window.alert(e);
    }
  }

  async function fetchAllFiles(): Promise<void> {
    try {
      const res = await NetworkCalls.fetchAllFiles(
        props.siteId,
        abortController,
      );

      const filesArr: fileInfo[] = res
        .map((file: { url: string; name: string }) => {
          return {
            url: file.url,
            name: file.name,
          };
        })
        .sort((a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name),
        );

      setAllFiles(filesArr);
    } catch (e) {
      window.alert(e);
    }
  }

  async function fetchSubdirectory(id: string): Promise<void> {
    try {
      const res: any = await NetworkCalls.fetchDirectoryFromId(
        id,
        props.siteId,
        abortController,
      );
      const subdirectory: folderInfo = {
        id: id,
        name: res.name,
      };
      setSubDirectories((subDirectories) =>
        [...subDirectories, subdirectory].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
    } catch (e) {
      window.alert(e);
    }
  }

  async function fetchParentDirectories(id: string): Promise<void> {
    try {
      const res: any = await NetworkCalls.fetchDirectoryFromId(
        id,
        props.siteId,
        abortController,
      );
      const folderBreadcrumb: folderInfo = {
        id: id,
        name: res.name,
      };
      setFolderBreadcrumbs((folderBreadcrumbs) => [
        ...folderBreadcrumbs,
        folderBreadcrumb,
      ]);
      if (res.parent) {
        fetchParentDirectories(res.parent);
      }
    } catch (e) {
      window.alert(e);
    }
  }

  async function fetchParent(id: string | undefined): Promise<void> {
    try {
      if (!id) return;
      const res: any = await NetworkCalls.fetchDirectoryFromId(
        id,
        props.siteId,
        abortController,
      );
      setParent({
        id: id,
        name: res.name,
      });
    } catch (e) {
      window.alert(e);
    }
  }

  async function fetchDirectory(directoryName?: string): Promise<void> {
    try {
      let res: any = [];
      directoryName !== undefined
        ? (res = await NetworkCalls.fetchDirectoryFromId(
            directoryName,
            props.siteId,
            abortController,
          ))
        : (res = await NetworkCalls.fetchDirectory(
            props.siteId,
            abortController,
            directoryName,
          ));
      setOriginalFiles([]);
      setFiles([]);
      setSubDirectories([]);
      setCurrentFolder(res.name);
      fetchParent(res.parent);
      setFolderBreadcrumbs([{ id: "", name: res.name }]);
      setSearchValue("");
      if (res.parent !== undefined) {
        fetchParentDirectories(res.parent);
      }

      if (res.subdirectories !== undefined)
        res.subdirectories.map((e: any) => fetchSubdirectory(e));
      if (res.files !== undefined) res.files.map((e: any) => fetchFiles(e));
    } catch (e) {
      window.alert(e);
    }
  }

  function searchFunction(arr: any[], searchKey: any) {
    return arr.filter(function (obj: any) {
      return Object.keys(obj).some(function (key) {
        return obj[key].toLowerCase().includes(searchKey.toLowerCase());
      });
    });
  }

  function handleSearch(e: string) {
    setSearchValue(e);
    const searchedData = e === "" ? originalFiles : searchFunction(allFiles, e);
    setFiles(
      searchedData.map((file: any) => ({
        url: file.url,
        name: file.name,
      })),
    );
  }

  const dirClickHandler = (directoryId: string, directoryName: string) => {
    if (directoryName !== currentFolder && directoryName.length > 0) {
      fetchDirectory(directoryId);
    }
  };

  function getBreadcrumbs() {
    return (
      <h2 className={DocumentationStyles.breacrumbContainer}>
        {folderBreadcrumbs.map((dir, i) => {
          return (
            <div key={i}>
              {i + 1 === folderBreadcrumbs.length ? (
                ""
              ) : (
                <i className="fas fa-chevron-right" />
              )}
              <button
                onClick={() => dirClickHandler(dir.id, dir.name)}
                className={classNames(DocumentationStyles.breadcrumb, {
                  [DocumentationStyles.currentFolder]:
                    dir["name"] === currentFolder,
                })}
              >
                {dir["name"]}
              </button>
            </div>
          );
        })}
      </h2>
    );
  }

  function getDocumentationHeader() {
    return (
      <div className={DocumentationStyles.documentationHeader}>
        <div className={DocumentationStyles.rowHeader}>
          <button
            onClick={() => dirClickHandler(parent.id, parent.name)}
            className={DocumentationStyles.backButton}
          >
            <i className="fas fa-arrow-alt-circle-left" />
          </button>
          {getBreadcrumbs()}
          <div className={DocumentationStyles.fileFilters}>
            <div className={DocumentationStyles.searchBar}>
              <i
                className={classNames(
                  "fas fa-search",
                  DocumentationStyles.searchIcon,
                )}
              />
              <input
                placeholder="Search for a document..."
                onChange={(e) => handleSearch(e.target.value)}
                className={DocumentationStyles.inputSearch}
                value={searchValue}
              />
            </div>
            <div className={DocumentationStyles.switchComponent}>
              <p>Change View: </p>
              <Switch
                checked={!fileView}
                onClick={() => setFileView(!fileView)}
                color="primary"
              />
              {!fileView ? (
                <p className={DocumentationStyles.view}>List View</p>
              ) : (
                <p className={DocumentationStyles.view}>File View</p>
              )}
            </div>
          </div>
        </div>
        <hr />
      </div>
    );
  }

  function getFolders() {
    return subDirectories.map((directory, i) => {
      return (
        <button
          className={DocumentationStyles.individualFolderView}
          key={i}
          onClick={() => dirClickHandler(directory["id"], directory["name"])}
        >
          <div className={DocumentationStyles.folderLink}>
            <i className="fas fa-folder" />
          </div>
          <p className={DocumentationStyles.folderName}>{directory["name"]}</p>
        </button>
      );
    });
  }

  function getFileView() {
    return files.map((file: fileInfo, i) => {
      return (
        <div className={DocumentationStyles.individualFileView} key={i}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            type="application/pdf"
            href={file.url.replace(" ", "%20").replace("\\", "/")}
            className={DocumentationStyles.fileLink}
          >
            <p className={DocumentationStyles.fileDesc}>{file.name}</p>
            <i className="fas fa-file" />
          </a>
          <p className={DocumentationStyles.fileName}>{file.name}</p>
        </div>
      );
    });
  }

  function getListView() {
    return (
      <Table aria-label="simple table">
        <TableBody>
          {files.map((file: fileInfo, i) => (
            <TableRow key={i}>
              <TableCell component="th" scope="row">
                <a
                  href={file.url.replace(" ", "%20").replace("\\", "/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  type="application/pdf"
                >
                  <i className="fas fa-file" />
                  {file.name}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Grid
      container
      className={DocumentationStyles.grid}
      style={{ display: "inline-block" }}
    >
      <Grid
        item
        xs={11}
        className={DocumentationStyles.gridItemFirst}
        style={{ margin: "auto" }}
      >
        <h1>Documentation</h1>
        {getDocumentationHeader()}
      </Grid>
      {subDirectories.length > 0 ? (
        <Grid
          item
          xs={11}
          className={DocumentationStyles.gridItem}
          style={{ margin: "auto" }}
        >
          <h3>Folders</h3>
          <div className={DocumentationStyles.folderView}>{getFolders()}</div>
        </Grid>
      ) : (
        ""
      )}
      {files.length > 0 ? (
        <Grid
          item
          xs={11}
          className={DocumentationStyles.gridItem}
          style={{ margin: "auto" }}
        >
          <h3>Files</h3>
          {fileView ? (
            <div className={DocumentationStyles.fileView}>{getFileView()}</div>
          ) : (
            <div className={DocumentationStyles.listView}>{getListView()}</div>
          )}
        </Grid>
      ) : (
        ""
      )}
    </Grid>
  );
}
