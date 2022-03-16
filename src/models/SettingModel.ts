import { Schema, Document, Model, model } from 'mongoose';

export interface ISettings extends Document {
  mediaPageVisibility: boolean;
  faqPageVisibility: boolean;
}

const SettingSchema: Schema = new Schema({
  mediaPageVisibility: {type: Boolean},
  faqPageVisibility: {type: Boolean}
});

export const Settings: Model<ISettings> = model<ISettings>('Settings', SettingSchema);
