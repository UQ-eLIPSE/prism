import { ObjectId, ObjectID } from 'bson';
import { Schema, Document, Model, model } from 'mongoose';
export interface IMapPins extends Document {
  _id?: any;
  x: number;
  y: number;
  icon: string;
  cover_image: string;
  site: any;
  external_link?: string;
}

const MapPinsSchema: Schema = new Schema({
  _id: {
    type: ObjectID,
    auto: true
  },
  site: { type: ObjectID },
  x: { type: Number },
  y: { type: Number },
  icon: { type: String },
  cover_image: { type: String },
  external_link: { type: String },
});

export const MapPins: Model<IMapPins> = model<IMapPins>(
  'map_pins',
  MapPinsSchema,
);
