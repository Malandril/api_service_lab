
import mongoose from "mongoose";
import {Customer} from "uberoo-commons";
export type DeliveryStatus = mongoose.Document &{
    id: number;
    creation: number;
    status: string;
    history: {status: string, event: string}[];
    customer: Customer;

};