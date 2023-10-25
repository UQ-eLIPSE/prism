import { Schema, Document, Model, model } from "mongoose";

export interface IQuestionAnswer extends Document {
  idx: number;
  question: string;
  answer: string;
}

const FAQSchema: Schema = new Schema({
  idx: { type: Number, unique: true },
  question: { type: String },
  answer: { type: String },
});

export const FAQ: Model<IQuestionAnswer> = model<IQuestionAnswer>(
  "FAQ",
  FAQSchema,
);
