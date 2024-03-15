import React, { useEffect, useState } from "react";
import { NavLink } from "../elements/NavLink";
import { useLocation } from "react-router";
import NetworkCalls from "../utils/NetworkCalls";
import prism_logo from "../img/prism-logo.svg";
import { useUserContext } from "../context/UserContext";
import { useSettingsContext } from "../context/SettingsContext";
import { ISettings } from "../typings/settings";
import ModuleWindow, { MEDIA_TYPES, ModuleWindowProps } from "./ModuleWindow";

export interface ISidebarLink {
  link: string;
  icon: string | React.JSX.Element;
  text: string;
  dataCy: string;
}

interface ISidebarProps {
  config?: ISettings;
  floor: string;
  siteId: string;
  onClick: () => void;
}
type ModuleWindowContent = Pick<
  ModuleWindowProps,
  "contentType" | "contentAlt" | "contentSrc" | "autoplay"
>;
/**
 * Sidebar Component handles navigation between different views of Prism
 *
 * Required Views:
 * Home: Returns to the Site Pins Map Page
 * Site: The Scene viewer
 *
 * @param props site configurations, will contain what, siteMode: whether the site already has scenes uploaded (show add scenes and site icon on sidenb)
 */
const Sidebar: React.FC<ISidebarProps> = (props) => {
  const [moduleWindowContent, setModuleWindowContent] =
    useState<ModuleWindowContent>({
      contentType: MEDIA_TYPES.VIDEO,
      contentAlt: props.config?.animation.title
        ? props.config?.animation.title
        : "",
      contentSrc: props.config?.animation.url
        ? props.config?.animation.url
        : "",
      autoplay: true,
    });
  const [moduleWindowOpen, setModuleWindowOpen] = useState<boolean>(false);
  const [settings] = useSettingsContext();
  const [hideMenu] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(
    settings?.enableMultiSite ? "site" : "/",
  );
  const [links, setLinks] = useState<ISidebarLink[]>([]);
  const location = useLocation();
  const [addHidden, setAddHidden] = useState<boolean>(true);
  const [user] = useUserContext();

  /**
   * Create NavLink objects for rendering,
   * if config.enable changes these will update
   */
  useEffect(() => {
    const siteLink = {
      link: `site`,
      icon:
        props.config?.display.title == "Urban Water" ? (
          <img
            src="data:image/png;base64,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"
            alt="Image Logo"
          />
        ) : (
          "fas fa-object-group fa-2x"
        ),
      text: props.config ? "Site" : "Add Scenes",
      dataCy: "sb-site",
    };
    const homeLink = {
      link: "/",
      icon: prism_logo,
      text: "",
      dataCy: "sb-home",
    };

    const aboutLink = {
      link: "/about",
      icon: "fas fa-file-alt fa-2x",
      text: "About",
      dataCy: "sb-about",
    };

    const documentationLink = {
      link: "documentation",
      icon: "fas fa-folder fa-2x",
      text: "Documentation",
      dataCy: "sb-documentation",
    };

    const addScene = {
      link: props.config ? "addScene" : "",
      icon: props.config ? "fas fa-film fa-2x" : "",
      text: props.config ? "Add Scene" : "",
      dataCy: props.config ? "sb-addScene" : "",
    };

    const createLinks: ISidebarLink[] = [];

    // If the user is an admin then enable addScene link
    window._env_.USE_SSO === false || user?.isAdmin
      ? createLinks.push(homeLink, siteLink, addScene)
      : createLinks.push(homeLink, siteLink);

    props.config &&
      props.config.enable.documentation &&
      createLinks.push(documentationLink);
    props.config && props.config.enable.about && createLinks.push(aboutLink);

    setLinks(createLinks);
    checkLinks(createLinks);
  }, [props.config, location]);

  useEffect(() => {
    NetworkCalls.getFloorSurveyExistence(
      props.siteId,
      Number(props.floor),
    ).then((res) => {
      if (res.floorPopulated !== undefined) {
        setAddHidden(!res.floorPopulated);
      }
    });
  }, [props.floor, props.siteId]);

  const setPath = (selectedLink: string) => {
    setCurrentPath(selectedLink);
  };

  const checkLinks = (linkList: ISidebarLink[]) => {
    const path = location.pathname.split("/");

    for (const value of linkList) {
      if (
        path[path.length - 1] === value.link ||
        (!settings?.enableMultiSite && value.link === "/")
      )
        setPath(value.link);
    }
  };

  const enableModuleWindow: React.MouseEventHandler<HTMLElement> = (e) => {
    console.log(e);
    if (moduleWindowOpen) {
      setModuleWindowOpen(false);
    } else {
      setModuleWindowContent({
        contentType: MEDIA_TYPES.VIDEO,
        contentAlt: props.config?.animation.title
          ? props.config?.animation.title
          : "",
        contentSrc: props.config?.animation.url
          ? props.config?.animation.url
          : "",
        autoplay: true,
      });
    }
    setModuleWindowOpen(true);
  };

  return (
    <aside data-cy="sb" className="sidebar">
      {moduleWindowOpen && (
        <ModuleWindow
          contentType={moduleWindowContent.contentType}
          contentSrc={moduleWindowContent.contentSrc}
          contentAlt={moduleWindowContent.contentAlt}
          closeHandler={() => {
            setModuleWindowOpen(false);
          }}
          autoplay={moduleWindowContent.autoplay}
        />
      )}
      <nav>
        {links.map((value, index) => {
          if (!(addHidden && settings?.enableMultiSite)) {
            return (
              <NavLink
                key={index}
                value={value}
                currentPath={currentPath}
                hideMenu={hideMenu}
                setPath={setPath}
              />
            );
          }
        })}
      </nav>
      {props.config?.enable.animations && (
        <nav onClick={(e) => enableModuleWindow(e)}>
          <a
            href="#"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span
              className="nav-icon"
              data-title={moduleWindowContent.contentAlt}
              data-cy="sb-icon"
              style={{
                textAlign: "center",
              }}
            >
              <i className="fas fa-play-circle fa-2x" />
            </span>
            <span
              className={"nav-text"}
              data-cy="sb-text"
              style={{ textAlign: "center" }}
            >
              Animation
            </span>
          </a>
        </nav>
      )}

      <div className="nav-icon-container">
        {user?.isAdmin && (
          <>
            <button
              className="nav-text"
              style={{ border: "none", backgroundColor: "transparent" }}
              onClick={props.onClick}
            >
              Enable Multisite
            </button>
          </>
        )}
      </div>
      <div className="prism-label">
        <a onClick={() => window.open("https://www.elipse.uq.edu.au/")}>
          {/* {props.config?.display.title == "Urban Water" && (
            <img
              src="data:image/png;base64,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"
              alt="Image Logo"
            />
          )} */}
          <img
            className="prismLogo"
            style={{
              height: "4em",
              width: "4em",
            }}
            src="https://stluc.manta.uqcloud.net/elipse/public/PRISM/prod/urban_water/uq_logo.png"
            alt="UQ Logo"
          />
          <h3 className="prism-subtitle">Prism</h3>
          <h5 className="prism-subheading">by eLIPSE</h5>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
