import { Schema, Document, Model, model } from "mongoose";
import { IUser } from "./UserModel";

/**
 * Typescript interface
 */
export interface IArea extends Document {
  name: string;
  description: string;
}

export interface ICategory extends Document {
  name: string;
  subcategories: ISubcategory[];
}

export interface ISubcategory extends Document {
  name: string;
  parentCategories: ICategory[];
}

export interface IType extends Document {
  name: string;
  description: string;
}

export interface IResource extends Document {
  name: string;
  description: string;
  url: string;
  area_name: IArea;
  category: ICategory;
  subcategory: ISubcategory;
  resource_type: string;
  content_type: string;
  uploaded_by: IUser;
  uploaded_at: string;
  modified_by: IUser;
  modified_at: string;
}

export interface IDirectories extends Document {
  name: string;
  subdirectories: IDirectories[];
  files: IFiles[];
  parent: IDirectories;
}

export interface IFiles extends Document {
  name: string;
  url: string;
  uploaded_at: string;
}

export interface IAbout extends Document {
  info: string;
}

/**
 * Mongoose Schema for Resource, Category, Subcategory, Area, Type
 */
const AreaSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  subcategories: [{ type: Schema.Types.ObjectId, ref: "Subcategory" }],
});

const SubcategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  parentCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

const TypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const ResourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  area_name: { type: Schema.Types.Mixed, ref: "Area" },
  category: { type: Schema.Types.Mixed, ref: "Category" },
  subcategory: { type: Schema.Types.Mixed, ref: "Subcategory" },
  resource_type: { type: Schema.Types.Mixed, ref: "Type" },
  content_type: { type: String, required: true },
  uploaded_at: { type: Date, required: true },
  uploaded_by: { type: Schema.Types.Mixed, required: true, ref: "User" },
  modified_at: { type: Date },
  modified_by: { type: Schema.Types.Mixed, ref: "User" },
});

const FilesSchema: Schema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploaded_at: { type: Date, required: true },
});

const DirectoriesSchema: Schema = new Schema({
  name: { type: String, required: true },
  subdirectories: [{ type: Schema.Types.ObjectId, ref: "Directories" }],
  files: [{ type: Schema.Types.ObjectId, ref: "Documentation" }],
  parent: { type: Schema.Types.ObjectId, ref: "Documentation" },
});

const AboutSchema: Schema = new Schema({
  info: { type: String, required: true },
});

export const Area: Model<IArea> = model<IArea>("Area", AreaSchema);
export const Category: Model<ICategory> = model<ICategory>(
  "Category",
  CategorySchema
);
export const Subcategory: Model<ISubcategory> = model<ISubcategory>(
  "Subcategory",
  SubcategorySchema
);
export const Type: Model<IType> = model<IType>("Type", TypeSchema);
export const Resource: Model<IResource> = model<IResource>(
  "Resource",
  ResourceSchema
);
export const Files: Model<IFiles> = model<IFiles>(
  "files",
  FilesSchema,
  "files"
);
export const Directories: Model<IDirectories> = model<IDirectories>(
  "Directories",
  DirectoriesSchema,
  "directories"
);
export const About: Model<IAbout> = model<IAbout>(
  "About",
  AboutSchema,
  "about"
);
