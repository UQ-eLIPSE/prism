import React from "react";
import { Icon } from "@material-ui/core";
import { HotspotDescription } from "../interfaces/HotspotDescription";
import ModuleWindow, { MEDIA_TYPES, ModuleWindowProps } from "./ModuleWindow";

const mainImgSize: string[] = ["400px", "250px"]; // Size of mainImg (header image)

type ModuleWindowContent = Pick<
  ModuleWindowProps,
  "contentType" | "contentAlt" | "contentSrc"
>;

interface Props {
  sideNavOpen: boolean;
  infoPanelOpen: boolean; // Is the InfoPanel Open?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeInfoPanelOpen: any; // Function to open/close InfoPanel.
  hotspotDescription: HotspotDescription | undefined; // undefined = no description.
}

interface State {
  headerLoading: boolean; // Header image loading state.
  descriptionLoading: boolean; // Document loading state.

  //For module window
  moduleWindowOpen: boolean;
  moduleWindowContent: ModuleWindowContent;
}

export default class InfoPanel extends React.Component<Props, State> {
  public state = {
    headerLoading: true,
    descriptionLoading: true,

    //For module window
    moduleWindowOpen: false,
    moduleWindowContent: {
      contentType: MEDIA_TYPES.IMAGE,
      contentAlt: "",
      contentSrc: "",
      autoplay: false,
    },

    info: {
      id: "",
      header: {
        mainImgUrl: "",
        labelTitle: "",
        mainTitle: "",
        description: "",
      },
      locations: [""],
      performanceUrl: "",
      processUrl: "",
      resources: [
        {
          url: "",
          type: "",
        },
      ],
    },
  };

  private abortController = new AbortController();

  private processMediaResource(element: HTMLElement): ModuleWindowContent {
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case "img":
        return {
          contentType: MEDIA_TYPES.IMAGE,
          contentAlt: element.getAttribute("alt") || "",
          contentSrc: element.getAttribute("src") || "",
        };

      case "video": {
        const getSource = element.getElementsByTagName("source");
        //Think of a way to have multiple sources
        if (getSource.length && getSource[0]) {
          return {
            contentType: MEDIA_TYPES.VIDEO,
            contentAlt: getSource[0].getAttribute("alt") || "",
            contentSrc: getSource[0].getAttribute("src") || "",
          };
        } else {
          return {
            contentType: MEDIA_TYPES.VIDEO,
            contentAlt: element.getAttribute("alt") || "",
            contentSrc: element.getAttribute("src") || "",
          };
        }
      }
      default:
        return {
          contentType: MEDIA_TYPES.IMAGE,
          contentAlt: "",
          contentSrc: "",
        };
    }
  }

  public enlargeMediaOnClick(event: MouseEvent): void {
    event.preventDefault();

    if (!event.target) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaTag = (event.target as any).tagName || "";
    if (!mediaTag) return;

    const acceptableTagnames = ["img", "video"];
    if (!acceptableTagnames.includes(mediaTag.toLowerCase())) return;

    const moduleWindowContent = this.processMediaResource(
      event.target as HTMLElement,
    );
    this.setState({
      moduleWindowContent,
      moduleWindowOpen: !!moduleWindowContent.contentSrc.length,
    });
  }

  public closeModuleWindowOnClick() {
    this.setState({
      moduleWindowOpen: false,
    });
  }

  public componentWillUnmount(): void {
    this.abortController.abort();
  }

  public render() {
    // Preprocess this.props.hotspotDescription.
    const document: HotspotDescription = this.props.hotspotDescription ?? {
      header: {
        main_img_url: "",
        label_title: "",
      },
      contents: [
        {
          title: "Unable to fetch data.",
          content: "Please try again later.",
        },
      ],
      tiles_id: "",
      info_id: "",
    };

    // Provide message if no data in contents is available.
    if (
      !document.contents ||
      !Array.isArray(document.contents) ||
      !document.contents.length
    ) {
      document.contents = [{ title: "No content available.", content: "" }];
    }

    return (
      <div className="info-container" data-cy="info-panel">
        {this.state.moduleWindowOpen &&
          !!this.state.moduleWindowContent.contentSrc && (
            <ModuleWindow
              contentType={this.state.moduleWindowContent.contentType}
              contentSrc={this.state.moduleWindowContent.contentSrc}
              contentAlt={this.state.moduleWindowContent.contentAlt}
              closeHandler={() => this.closeModuleWindowOnClick()}
              autoplay={this.state.moduleWindowContent.autoplay}
            />
          )}

        <div className="info-header">
          <div className="button-container">
            <button
              className={`icon ${
                this.props.sideNavOpen ? "side-nav-open" : ""
              }`}
              onClick={() =>
                this.props.changeInfoPanelOpen(!this.props.infoPanelOpen)
              }
            >
              <Icon className="far fa-times-circle" />
            </button>
          </div>

          {this.state.headerLoading && (
            <div
              className="loadingspinner"
              style={{
                width: mainImgSize[0],
                height: mainImgSize[1],
              }}
            >
              <i className="fas fa-spinner fa-pulse" />
            </div>
          )}

          <div>
            <img
              className={`main-img ${this.state.headerLoading ? "hide" : ""}`}
              width={mainImgSize[0]}
              height={mainImgSize[1]}
              src={document.header.main_img_url ?? ""}
              alt={document.header.label_title ?? ""}
              onLoad={() => {
                this.setState({ headerLoading: false });
              }}
            />
            <label className="panel-label">
              {document.header.label_title ?? ""}
            </label>
          </div>
        </div>

        <div
          className="info-content"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(e: any) => this.enlargeMediaOnClick(e)}
        >
          {document.contents.map((section, index) => {
            return (
              <section key={index}>
                <h2>{section.title}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: section.content,
                  }}
                />
              </section>
            );
          })}
        </div>
      </div>
    );
  }
}
