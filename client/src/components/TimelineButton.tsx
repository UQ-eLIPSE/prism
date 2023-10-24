import React from "react";
import classNames from "classnames";
import ButtonStyles from "../sass/partials/_timelineButton.module.scss";

export default class Timeline extends React.Component<
  {
    timelineOpen: boolean;
    changeTimelineOpen: (value: boolean) => void;
    floorExists: boolean;
  },
  object
> {
  private changeIcon(): React.ReactElement {
    return this.props.timelineOpen ? (
      <i className={"fas fa-chevron-right"} />
    ) : (
      <i className={"fa fa-chevron-left"} />
    );
  }

  public render() {
    return (
      <button
        className={classNames(
          ButtonStyles.timelineButton,
          !this.props.timelineOpen
            ? [ButtonStyles.timelineOpen]
            : [ButtonStyles.timelineClosed],
          !this.props.floorExists && [ButtonStyles.timelineHidden],
        )}
        onClick={(): void =>
          this.props.changeTimelineOpen(!this.props.timelineOpen)
        }
        data-cy="timeline-button"
        title={!this.props.timelineOpen ? "Open Timeline" : "Close Timeline"}
      >
        <div className={ButtonStyles.icon}>{this.changeIcon()}</div>
      </button>
    );
  }
}
