/**
 * Settings interface defines the configuration settings for a range of functionality
 */
export interface ISettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  //specifies which features are enabled
  enable: {
    timeline: boolean; //sidebar for showing different surveys
    rotation: boolean; //not sure
    media: boolean; //previews a video?
    faq: boolean; //enables a FAQ page
    documentation: boolean; //enables the documentation filesystem feature
    floors: boolean; //allows users to navigate to different floors if they exist
    about: boolean; //enables the about page
    hotspots_nav: boolean; // enables hotspots dropdown
    animations: boolean; //same as media?
  };
  //settings related to minimap functionality
  minimap: {
    image_url: string; //url to mini image (when it is not expanded)
    image_large_url: string; //url to image (when expanded)
    x_pixel_offset: number; //offset from certain point (not sure where or how this is calculated)
    y_pixel_offset: number;
    x_scale: number;
    y_scale: number;
    img_width: number; //width of minimap image
    img_height: number; //height of minimap image
    xy_flipped: boolean; //flips the x, y -> y, x
  };
  //Intial settings for when the user first enters a site
  initial_settings: {
    date: string; //sets the specific survey
    floor: number; //sets the appropriate starting floor (default this to 1)
    pano_id: string; //string id relating to intial pano (could be a relation)

    //see this article for explanation of pitch and yaw:
    //https://howthingsfly.si.edu/flight-dynamics/roll-pitch-and-yaw
    yaw: number;
    pitch: number;

    fov: number; //field of view, how zoomed in the marzipano camera is
    rotation_offset: number;
  };
  animation: {
    url: string; //url to animation video
    title: string; //name of video
  };
  //config sidenav
  sidenav: {
    logo_url: string; //url to the logo image
    subtitle_url: string; //url to the subtitle image
  };
  //settings related to general display options
  display: {
    title: string;
    subtitle: string;
    background_image: string;
    uq_logo: string;
  };
  //view mode for the marzipano tool
  marzipano_mouse_view_mode: string;

  //number of floors, used for multi-story buildings generally 0
  num_floors: number;
}
