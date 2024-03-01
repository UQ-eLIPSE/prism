import { ISettings } from "../../../src/typings/settings";

const mockConfig: ISettings = {
  _id: "mockConfigId",
  enable: {
    timeline: true,
    rotation: false,
    media: false,
    faq: false,
    documentation: true,
    floors: true,
    about: false,
    hotspots_nav: false,
    animations: false,
  },
  initial_settings: {
    date: "2021-11-16T00:00:00.000+10:00",
    floor: 1,
    pano_id: "1-78_2_8_945_409",
    yaw: 0,
    pitch: 0,
    fov: 0,
    rotation_offset: 0,
  },
  animation: {
    url: "http://example.com/animation.mp4",
    title: "Mock Animation",
  },
  sidenav: {
    logo_url: "http://example.com/logo.png",
    subtitle_url: "http://example.com/subtitle.png",
  },
  display: {
    title: "Mock Site Title",
    subtitle: "Mock Site Subtitle",
    background_image: "http://example.com/background.jpg",
    uq_logo: "http://example.com/uq_logo.png",
  },
  marzipano_mouse_view_mode: "default",
  num_floors: 3,
  site: "mockSite",
};

export const mockSiteProps = {
  siteId: "mockSiteId",
  config: mockConfig,
  updateFloor: jest.fn(),
};
