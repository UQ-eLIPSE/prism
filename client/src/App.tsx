import React, { useEffect } from "react";
import { BrowserRouter, Route, useNavigate } from "react-router-dom";
import SiteHome from "./components/SiteHome";
import SiteSelector from "./components/SiteSelector";
import { Routes } from "react-router-dom";
import { useUserContext } from "./context/UserContext";
import NetworkCalls from "./utils/NetworkCalls";
import { IUser, UserRoles } from "./interfaces/User";
import { useSettingsContext } from "./context/SettingsContext";

const MainContent: React.FC = () => {
  const [user, updateTestContext] = useUserContext();
  const [settings, updateSettingsContext] = useSettingsContext();

  const navigate = useNavigate();

  const fetchUser = async () => {
    const userInfo: IUser = await NetworkCalls.getLoginUserInfo();
    if (userInfo)
      updateTestContext(
        userInfo.role.includes(UserRoles.SUPERADMIN || UserRoles.PROJECTADMIN)
          ? {
              ...userInfo,
              isAdmin: true,
            }
          : userInfo,
      );

    if (window._env_.USE_SSO === false) {
      updateTestContext({
        ...userInfo,
        isAdmin: true,
      });
    }
  };

  const fetchSettings = async () => {
    const settingsResp = await NetworkCalls.getFullSiteSettings();
    if (settingsResp.success) updateSettingsContext(settingsResp.payload);
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }

    if (!settings) {
      fetchSettings();
    }
  }, []);

  const handleEnableMultiSite = () => {
    updateSettingsContext({ ...settings, enableMultiSite: true });
    navigate("/");
  };

  const handleDisableMultiSite = () => {
    updateSettingsContext({ ...settings, enableMultiSite: false });
  };
  return (
    <div className="mainApp">
      <Routes>
        <Route
          path="/site/:siteId/*"
          element={<SiteHome onButtonClick={handleEnableMultiSite} />}
        />
        <Route
          exact
          path="/*"
          element={
            settings?.enableMultiSite ? (
              <SiteSelector onButtonClick={handleDisableMultiSite} />
            ) : (
              <SiteHome onButtonClick={handleEnableMultiSite} />
            )
          }
        />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
};

export default App;
