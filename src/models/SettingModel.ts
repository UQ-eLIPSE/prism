import { Schema, Document, Model, model } from "mongoose";

export interface ISettings extends Document {
  enableMultiSite: boolean;
  mediaPageVisibility: boolean;
  faqPageVisibility: boolean;
  singleSiteSettings?: ISingleSiteSettings;
}

export interface ISingleSiteSettings extends Document {
  backgroundImage: string;
  siteTitle: string;
}

const SettingSchema: Schema = new Schema({
  enableMultiSite: { type: Boolean },
  mediaPageVisibility: { type: Boolean },
  faqPageVisibility: { type: Boolean },
  singleSiteSettings: { type: Schema.Types.Mixed },
});

export const Settings: Model<ISettings> = model<ISettings>(
  "Settings",
  SettingSchema,
);
