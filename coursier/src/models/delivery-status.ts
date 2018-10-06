import {Document, Schema, Model, model} from "mongoose";

export interface IDeliveryStatusModel extends Document {
    order: {
        client: {address: string, name: string, phone: string},
        meals: {name: string, price: number, eta: number, category: string}
    };
    creation: Date;
    status: string;
    history: {status: string, event: string}[];
    recordEventToHistory(event: string): void;
}

export let DeliveryStatusSchema: Schema = new Schema({
    order: {
        client: {address: String, name: String, phone: String},
        meals: {name: String, price: Number, eta: Number, category: String}
    },
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
export const DeliveryStatusModel: Model<IDeliveryStatusModel> = model<IDeliveryStatusModel>("DeliveryStatus", DeliveryStatusSchema);