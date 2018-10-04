import { Request, Response } from "express";
import { Customer } from "uberoo-commons";
import { DeliveryStatus } from "../models/delivery-status";
import { OrderCreation } from "../models/request/order-creation-request";
import { DeliveryStatusRequest } from "../models/request/delivery-status-request";
import { DeliveryStatusPostRequest } from "../models/request/delivery-status-post-request";
import {DocumentQuery} from "mongoose";

const mongoose = require("mongoose");


const myModel = mongoose.model("DeliveryStatus");
function saveDeliveryCreation(request: OrderCreation) {
    const m = new myModel({status: "CREATED", id: request.id } );
    m.save();
}

function sendError(message: string, res: Response) {
    res.statusCode = 412;
    res.send({error: message});
}

function manageErrors(status: boolean | string[], res: Response, callIfNoError: () => void) {
    if (status !== true) {
        const errors: string[] = status as string[];
        let result: string = "";
        for (let i = 0; i < errors.length; i++) {
            result += errors[i];
        }
        sendError(result, res);
    } else {
        callIfNoError();
    }
}

export let notifyOrder = (req: Request, res: Response) => {
    const orderCreation = OrderCreation.isOrderCreation(req.body);
    manageErrors(orderCreation, res, function () {
        const request: OrderCreation = req.body as OrderCreation;
        saveDeliveryCreation(request);

        res.json([{orderId: request.id}]);
    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    manageErrors(DeliveryStatusRequest.isDeliveryRequest(req.params), res, function () {
        const request: DeliveryStatusRequest = req.params as DeliveryStatusRequest;
        const mongoQuery: DocumentQuery<DeliveryStatus| null, DeliveryStatus>  = myModel.findOne({idDelivery: request.id});

        mongoQuery.exec(function (err, deliStatus: DeliveryStatus) {
            if (err) return  sendError( "Delivery " + request.id + "doesn't exist", res);
            console.log("Status :%s\n ", deliStatus.status);
            res.send({status: deliStatus.status});
        });
    });
};


export let updateStatus = (req: Request, res: Response) => {
    req.body.id = req.body.id | req.params.id;
    manageErrors(DeliveryStatusPostRequest.isDeliveryStatusPostRequest(req.body), res, function () {
        const request: DeliveryStatusPostRequest = req.body as DeliveryStatusPostRequest;
        const mongoQuery: DocumentQuery<DeliveryStatus| null, DeliveryStatus>  = myModel.findOne({idDelivery: request.id});

        mongoQuery.exec(function (err, deliStatus: DeliveryStatus) {
            if (err) return console.log(err);
            console.log("Status :%s\n ", deliStatus.status);
            deliStatus.status = request.status;
            deliStatus.history.push({status: deliStatus.status, event: "update-status"});
            deliStatus.save();
            res.send({status: deliStatus.status});
        });
    });
};



