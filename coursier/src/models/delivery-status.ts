
import mongoose from "mongoose";
export type DeliveryStatus = mongoose.Document &{
    id: number;
    creation: number;
    status: string;
    history: {status: string, event: string}[];

    /*
    constructor(id: number, creation: number, status: string) {
        this.id = id;
        this.creation = creation;
        this.status = status;
        this.history = [];
    }
    */
};