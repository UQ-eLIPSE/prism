import React, { useEffect, useState } from "react";
import "../sass/App.scss";
import "../utils/Marzipano/Marzipano.scss";
import Dotenv, { IConfiguration } from "../utils/Dotenv";
import Sidebar from "./Sidebar";
import Site from "./Site";
import Documentation from "./Documentation";
import UploadFiles from "./UploadFiles";
import { ISettings } from "../typings/settings";
import { useParams } from "react-router-dom";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import NetworkCalls from "../utils/NetworkCalls";
import { ISites } from "../interfaces/Settings";
import { useSettingsContext } from "../context/SettingsContext";
import Home from "./Home";
import About from "./About";

interface SiteSelectorProps {
  onButtonClick: () => void;
}

const SiteHome = ({ onButtonClick }: SiteSelectorProps) => {
  const configSetting = Dotenv;

  const { siteId } = useParams();
  const [config, setConfig] = useState<ISettings>();
  const [floorId, setFloorId] = useState<number>(-1);
  const [user] = useUserContext();
  const [allSites, setAllSites] = useState<ISites[]>([]);
  const [settings] = useSettingsContext();

  /**
   * FetchSettings
   * Retrieves the settings using the settings endpoint and assign it
   * to the config state
   * @param config - ENV setting used to get the API address
   */
  const fetchSettings = async (config: IConfiguration) => {
    try {
      const settingsData = await fetch(
        `${window._env_ ? window._env_.API_URL : config.BASE_URL}/api/site/${
          siteId ? siteId : allSites[0]._id
        }/settings`,
        {
          method: "GET",
        },
      );
      if (!settingsData) throw new Error(settingsData);
      const response = await settingsData.json();
      setConfig(response.payload);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllSites = async () => {
    try {
      const sitesData = await NetworkCalls.getFullSites();
      if (!sitesData) throw new Error(sitesData);
      setAllSites(sitesData.payload);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (allSites.length === 0) {
      fetchAllSites();
    }
  }, []);

  useEffect(() => {
    if (!config && allSites.length !== 0) {
      fetchSettings(configSetting);
    }
  }, [allSites]);
  return (
    <div>
      <div className="App" style={{ display: "flex" }}>
        <Sidebar
          config={config}
          siteId={siteId || (allSites.length !== 0 && allSites[0]._id)}
          floor={floorId.toString()}
          onClick={onButtonClick}
        />

        {config ? (
          <Routes>
            {!settings?.enableMultiSite && (
              <Route
                exact
                path="/"
                element={
                  <Home
                    title={
                      settings && settings.singleSiteSettings?.siteTitle
                        ? settings.singleSiteSettings?.siteTitle
                        : ""
                    }
                    backgroundImage={
                      settings && settings.singleSiteSettings?.backgroundImage
                        ? settings.singleSiteSettings?.backgroundImage
                        : ""
                    }
                  />
                }
              />
            )}
            <Route
              path="/site"
              element={
                <Site
                  config={config}
                  siteId={siteId || (allSites.length !== 0 && allSites[0]._id)}
                  updateFloor={(floor: number) => setFloorId(floor)}
                />
              }
            />
            {config.enable.documentation && (
              <Route
                path="/documentation"
                element={
                  <Documentation
                    config={config}
                    siteId={
                      siteId || (allSites.length !== 0 && allSites[0]._id)
                    }
                  />
                }
              />
            )}
            {config.enable.about && (
              <Route
                path="/about"
                element={
                  <About
                    siteId={
                      siteId || (allSites.length !== 0 && allSites[0]._id)
                    }
                  />
                }
              />
            )}
            <Route
              path="/addScene"
              element={
                <UploadFiles
                  siteId={siteId || (allSites.length !== 0 && allSites[0]._id)}
                  mode={"addScene"}
                  fetchSettings={() => fetchSettings(configSetting)}
                  timeline={config.enable.timeline}
                  floor={floorId}
                />
              }
            />
          </Routes>
        ) : (
          <>
            {user?.isAdmin && (
              <UploadFiles
                siteId={siteId || (allSites.length !== 0 && allSites[0]._id)}
                mode={"addNewSite"}
                fetchSettings={() => fetchSettings(configSetting)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SiteHome;
