import {Order} from "../../../commons/models";
import {Schema, Document, model, Model} from "mongoose";

export interface IOrderModel extends Order, Document {}

export let OrderSchema: Schema = new Schema({
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    meals: [{ type: Schema.Types.ObjectId, ref: "Meal" }]
});

OrderSchema.pre("save", function (next) {
    console.log("Save " + this);
    next();
});

export const OrderModel: Model<IOrderModel> = model<IOrderModel>("Order", OrderSchema);
