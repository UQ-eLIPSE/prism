import { ObjectId } from "bson";
import { Schema, Document, Model, model } from "mongoose";

// Note: Not sure if site_name is needed with the use of name, however,
// as it appears elsewhere in the code, will be kept for the time being.
export interface IMapPins extends Document {
  _id: ObjectId;
  x: number;
  y: number;
  icon: string;
  cover_image?: string;
  site: ObjectId;
  name: string;
  enabled: boolean;
  site_name?: string;
  external_url?: string;
  sitemap: string;
}

const MapPinsSchema: Schema = new Schema({
  _id: { type: ObjectId, auto: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  icon: { type: String },
  cover_image: { type: String },
  site: { type: ObjectId },
  name: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  site_name: { type: String, required: false },
  external_url: { type: String, required: false },
  sitemap: { type: String },
});

export const MapPins: Model<IMapPins> = model<IMapPins>(
  "map_pins",
  MapPinsSchema,
);
