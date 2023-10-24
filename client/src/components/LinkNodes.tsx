//
// Link Node List
//
// Styling is defined in _linkNodes.scss
//

import React from "react";
import { InfoHotspot, SurveyNode } from "../interfaces/NodeData";

interface PropsType {
  linkNodes: SurveyNode[] | string;
  infoNodes: InfoHotspot[] | string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onLinkNodeClick: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onInfoNodeClick: Function;
  timelineOpen: boolean;
  listOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateLinkNodes: Function;
}

export default class LinkNodes extends React.Component<PropsType, object> {
  // On click (link node object), perform stop propogation and handle node click event (as defined in prop types on LinkNodeClick)
  private handleLinkNodeClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    tilesId: string,
  ): void => {
    e.stopPropagation();
    this.props.updateLinkNodes(false);

    // Don't perform node function until other functions have finished
    setTimeout(() => {
      this.props.onLinkNodeClick(tilesId);
    }, 800);
  };

  // On click (info hotspot object), perform stop propogation and handle info hotspot event (as defined in prop types onInfoNodeClick)
  private handleInfoNodeClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    yaw: number,
    pitch: number,
    info_id: string,
  ): void => {
    e.stopPropagation();
    this.props.updateLinkNodes(false);

    // Don't perform node function until other functions have finished
    setTimeout(() => {
      this.props.onInfoNodeClick(yaw, pitch, info_id);
    }, 800);
  };

  public render() {
    // Constant that stores true or false based on whether or not menu is open
    const { listOpen } = this.props;

    // Return dropdown menu with list of link nodes and info hotspots (with corrosponding icons)
    return (
      <div
        className={`link-node-list ${
          this.props.timelineOpen ? "timelineOpen" : ""
        }`}
        data-cy="link-node-names"
        style={{
          animation: listOpen
            ? "0.5s openList forwards"
            : "0.5s closeList forwards",
        }} // Perform animations on open and close of menu
      >
        {typeof this.props.linkNodes !== "string" &&
          this.props.linkNodes.map(({ tiles_name, tiles_id }) => (
            <div
              className="linkNodeNames"
              onClick={(e): void => this.handleLinkNodeClick(e, tiles_id)}
              key={tiles_id}
            >
              <i className="fas fa-chevron-circle-up"></i>
              {tiles_name}
            </div>
          ))}

        {typeof this.props.infoNodes !== "string" &&
          this.props.infoNodes.map(({ title, yaw, pitch, info_id }) => (
            <div
              className="infoNodeNames"
              onClick={(e): void =>
                this.handleInfoNodeClick(e, yaw, pitch, info_id)
              }
              key={info_id}
            >
              <i className="fas fa-info-circle"></i>
              {title}
            </div>
          ))}
      </div>
    );
  }
}
