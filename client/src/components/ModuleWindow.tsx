/**
 * ModuleWindow.
 * A small preview is generated where it's first rendered.
 * Once clicked, it opens a full-sized render of the media.
 *
 * Takes either VIDEO (<video>) or IMAGE (<img>), defined by props.contentType.
 *
 * Example call:
 *   import ModuleWindow, {MEDIA_TYPES} from "../components/ModuleWindow";
 *   ...
 *   <ModuleWindow
 *     contentType={MEDIA_TYPES.IMAGE}
 *     contentSrc={require('../img/prism-logo.svg')}
 *     contentAlt={"Logo"}
 *   />
 */

import React from "react";
import { FormattedMessage } from "react-intl";
import ModuleWindowStyles from "../sass/partials/_moduleWindow.module.scss";

export enum MEDIA_TYPES {
  VIDEO = "video",
  IMAGE = "img",
}

export interface ModuleWindowProps {
  contentType: MEDIA_TYPES; // Type of media.
  contentSrc: string; // URL / File Path.
  contentAlt: string; // Alt tag.
  // eslint-disable-next-line @typescript-eslint/ban-types
  closeHandler: () => void;
  autoplay: boolean; // Autoplay functionality
}

export default class ModuleWindow extends React.Component<ModuleWindowProps> {
  constructor(props: ModuleWindowProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <div
          className={ModuleWindowStyles.module}
          onClick={this.props.closeHandler}
        >
          <button
            className={ModuleWindowStyles.close}
            onClick={this.props.closeHandler}
          >
            <i className="far fa-times-circle" />
          </button>

          <div
            className={ModuleWindowStyles.content}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {this.props.contentType === MEDIA_TYPES.VIDEO && (
              <video
                className="moduleVideo"
                controls
                autoPlay={this.props.autoplay}
              >
                <source src={this.props.contentSrc} />[{this.props.contentAlt}]
                <br />
                <FormattedMessage id="yourBrowserDoesNot" />
              </video>
            )}
            {this.props.contentType === MEDIA_TYPES.IMAGE && (
              <img
                className="moduleImage"
                src={this.props.contentSrc}
                alt={this.props.contentAlt}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
