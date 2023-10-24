import React from "react";

interface PropsType {
  firstLineName: string;
  secondLineName: string;
  timelineOpen: boolean;
}

export default class Title extends React.Component<PropsType, object> {
  public render() {
    return (
      <div
        className={`facility-name ${
          this.props.timelineOpen ? "timelineOpen" : ""
        }`}
        data-cy="facility-name"
      >
        <p className="firstLineName" data-cy="facility-name-title">
          {this.props.firstLineName}
        </p>
        <p className="secondLineName" data-cy="facility-name-subtitle">
          {this.props.secondLineName}
        </p>
      </div>
    );
  }
}
