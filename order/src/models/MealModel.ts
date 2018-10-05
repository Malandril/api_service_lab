import { Meal } from "uberoo-commons";
import {Schema, Document, model, Model} from "mongoose";

export interface IMealModel extends Meal, Document {}

export let MealSchema: Schema = new Schema({
    name: String,
    price: Number,
    eta: Number,
    category: String
});

MealSchema.pre("save", function (next) {
  console.log("Save " + this);
  next();
});

export const MealModel: Model<IMealModel> = model<IMealModel>("Meal", MealSchema);
