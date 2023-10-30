//
// Alternative Component to Title (./components/Title.tsx).
// TitleCard is more subtle than Title.
//
// Styling is defined in _title.scss
//

import React from "react";

interface PropsType {
  firstLineName: string;
  secondLineName?: string;
  timelineOpen: boolean;
}

export default class TitleCard extends React.Component<PropsType, object> {
  public render() {
    return (
      <div className={`title-card`} data-cy="facility-name">
        <p className="firstLineName" data-cy="facility-name-title">
          {this.props.firstLineName}
        </p>

        {this.props.secondLineName && (
          <p className="secondLineName" data-cy="facility-name-subtitle">
            {this.props.secondLineName}
          </p>
        )}
      </div>
    );
  }
}
