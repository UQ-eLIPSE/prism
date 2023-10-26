import React, { useEffect, useState } from "react";
import { NavLink } from "../elements/NavLink";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router";
import NetworkCalls from "../utils/NetworkCalls";
import prism_logo from "../img/prism-logo.svg";
import { useUserContext } from "../context/UserContext";
import { useSettingsContext } from "../context/SettingsContext";
import { ISettings } from "../typings/settings";

export interface ISidebarLink {
  link: string;
  icon: string;
  text: string;
  dataCy: string;
}

interface ISidebarProps {
  config?: ISettings;
  floor: string;
  siteId: string;
  onClick: () => void;
}

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
  // const [moduleWindowContent] = useState<ModuleWindowContent>({
  //     contentType: MEDIA_TYPES.VIDEO,
  //     contentAlt: props.config?.animation.title,
  //     contentSrc: props.config?.animation.url,
  //     autoplay: true,
  // });
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
      icon: "fas fa-object-group fa-2x",
      text: props.config ? "Site" : "Add Scenes",
      dataCy: "sb-site",
    };

    const homeLink = {
      link: "/",
      icon: "fas fa-map-marked-alt fa-2x",
      text: "Home",
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
    process.env.REACT_APP_USE_SSO === "false" || user?.isAdmin
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

  const navigate = useNavigate();
  return (
    <aside data-cy="sb" className="sidebar">
      <div className="prism-logo">
        <a
          onClick={() => {
            navigate("/");
          }}
        >
          <img className="prismLogo" src={prism_logo} alt="Prism by eLIPSE" />
        </a>
      </div>

      <nav>
        {links.map((value, index) => {
          if (!(addHidden && settings?.enableMultiSite)) {
            return (
              <NavLink
                value={value}
                key={index}
                currentPath={currentPath}
                hideMenu={hideMenu}
                setPath={setPath}
              />
            );
          }
        })}
      </nav>
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
          <h3 className="prism-subtitle">Prism</h3>
          <h5 className="prism-subheading">by eLIPSE</h5>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;