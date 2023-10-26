import { ObjectId } from "bson";
import { Schema, Document, Model, model } from "mongoose";

export interface ISiteSettings extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  // specifies which features are enabled
  enable: {
    timeline: boolean;
    rotation: boolean;
    media: boolean;
    faq: boolean;
    documentation: boolean;
    floors: boolean;
    about: boolean;
    animations: boolean;
    hotspots_nav: boolean;
  };

  // settings related to minimap functionality
  minimap: {
    image_url: string;
    image_large_url: string;
    x_pixel_offset: number; // offset from certain point (unsure of how this is calculated)
    y_pixel_offset: number; // not clear on what this does
    x_scale: number;
    y_scale: number;
    img_width: number;
    img_height: number;
    xy_flipped: boolean;
  };

  initial_settings: {
    date: string; // not sure what this does
    floor: number; // sets the appropriate starting floor (default this to 1)
    pano_id: string; // string id relating to intial pano (could be a relation)

    // see this article for explanation of pitch and yaw:
    // https://howthingsfly.si.edu/flight-dynamics/roll-pitch-and-yaw
    yaw: number;
    pitch: number;

    fov: number; // field of view, how zoomed in the marzipano camera is
  };

  animation: {
    url: string; // url to animation video, not sure exactly how this fits in
    title: string;
  };
  sidenav: {
    logo_url: string;
    subtitle_url: string;
  };

  // settings related to general display options
  display: {
    title: string;
    subtitle: string;
    background_image: string;
    uq_logo: string;
  };
  // view mode for the marzipano tool
  marzipano_mouse_view_mode: string;

  // number of floors, used for multi-story buildings generally 0
  num_floors: number;

  site: number;
}

export interface ISite extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  site_name: string;
  tag: string;
}

/**
 * Site map object
 */
export interface ISiteMap extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  name: string;
  image_url: string;
}

const SiteSettingSchema: Schema = new Schema({
  _id: {
    type: ObjectId,
  },
  enable: {
    type: {
      timeline: { type: Boolean },
      rotation: { type: Boolean },
      media: { type: Boolean },
      faq: { type: Boolean },
      documentation: { type: Boolean },
      floors: { type: Boolean },
      about: { type: Boolean },
      animations: { type: Boolean },
      hotspots_nav: { type: Boolean },
    },
  },
  minimap: {
    type: {
      image_url: { type: String },
      image_large_url: { type: String },
      x_pixel_offset: { type: Number },
      y_pixel_offset: { type: Number },
      x_scale: { type: Number },
      y_scale: { type: Number },
      img_width: { type: Number },
      img_height: { type: Number },
      xy_flipped: { type: Boolean },
    },
  },
  initial_settings: {
    type: {
      date: { type: String },
      floor: { type: Number },
      pano_id: { type: String },
      yaw: { type: Number },
      pitch: { type: Number },
      fov: { type: Number },
    },
  },
  animation: {
    type: {
      url: { type: String },
      title: { type: String },
    },
  },
  sidenav: {
    type: {
      logo_url: { type: String },
      subtitle_url: { type: String },
    },
  },
  display: {
    type: {
      title: { type: String },
      subtitle: { type: String },
      background_image: { type: String },
      uq_logo: { type: String },
    },
  },
  marzipano_mouse_view_mode: { type: String },
  num_floors: { type: Number },
  site: { type: Schema.Types.ObjectId, ref: "sites" },
});

const SiteSchema: Schema = new Schema({
  _id: {
    type: ObjectId,
  },
  site_name: { type: String },
  tag: { type: String },
});

/**
 * Schema for a site map rendered on the homepage
 */
const SiteMapSchema: Schema = new Schema({
  _id: {
    type: ObjectId,
  },
  image_url: { type: String },
  name: { type: String },
});

export const SiteSettings: Model<ISiteSettings> = model<ISiteSettings>(
  "site_settings",
  SiteSettingSchema,
);
export const Site: Model<ISite> = model<ISite>("sites", SiteSchema);
/**
 * This handles the site map on the homepage
 */
export const SiteMap: Model<ISiteMap> = model<ISiteMap>(
  "site_map",
  SiteMapSchema,
);