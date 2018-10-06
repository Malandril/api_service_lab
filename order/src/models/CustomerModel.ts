import {Customer} from "uberoo-commons";
import {Document, model, Model, Schema} from "mongoose";
import {ICustomerModel} from "./CustomerModel";

export interface ICustomerModel extends Customer, Document {}

export let CustomerSchema: Schema = new Schema ({
    address: String,
    name: String,
    phone: String
});

CustomerSchema.pre("save", function (next) {
    console.log("Save " + this);
    next();
});

export const CustomerModel: Model<ICustomerModel> = model<ICustomerModel>("Customer", CustomerSchema);
