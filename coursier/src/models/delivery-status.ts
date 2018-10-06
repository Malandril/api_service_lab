
import mongoose from "mongoose";
import {Customer} from "./customer";
import {Order} from "./order";




export type DeliveryStatus = mongoose.Document &{
    order: Order;
    creation: number;
    status: string;
    history: {status: string, event: string}[];
    customer: Customer;

};