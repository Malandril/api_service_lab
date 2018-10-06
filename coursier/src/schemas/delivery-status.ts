import {Document, Schema, Model, model} from "mongoose";
import {IDeliveryStatus} from "../models/dao/IDeliveryStatus";

export interface IDeliveryStatusModel extends IDeliveryStatus, Document {
    recordEventToHistory(event: string): void;
}

export let DeliveryStatusSchema: Schema = new Schema({
    order: {id: String},
    creation: Date,
    status: String,
    history: [{status: String, event: String}]
});
DeliveryStatusSchema.pre("save", function (next) {
    console.log("Save " + this);
    next();
});

DeliveryStatusSchema.methods.recordEventToHistory = function (event: string): void {
    this.history.push({status: this.status, event: event});
};
export const IDeliveryStatusModel: Model<IDeliveryStatusModel> = model<IDeliveryStatusModel>("DeliveryStatus", DeliveryStatusSchema);