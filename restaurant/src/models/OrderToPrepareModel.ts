import {Schema, Document, model, Model} from "mongoose";
import {Order} from "uberoo-commons";

export interface IOrderToPrepareModel extends Order, Document {}

export let OrderToPrepareSchema: Schema = new Schema({
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    meals: [{ type: Schema.Types.ObjectId, ref: "Meal" }]
});

OrderToPrepareSchema.pre("save", function (next) {
    console.log("Save " + this);
    next();
});

export const OrderToPrepareModel: Model<IOrderToPrepareModel> = model<IOrderToPrepareModel>("OrderToPrepare", OrderToPrepareSchema);
