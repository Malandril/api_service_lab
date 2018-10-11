import {Request, Response} from "express";
import {DeliveryStatus} from "../models/delivery-status";
import {OrderCreation} from "../models/request/order-creation-request";
import {DeliveryStatusRequest} from "../models/request/delivery-status-request";
import {DeliveryStatusPostRequest} from "../models/request/delivery-status-post-request";
import {DocumentQuery} from "mongoose";



const mongoose = require("mongoose");


const myModel = mongoose.model("DeliveryStatus");


export function routeMessage(topic: string, partition: string, message: any, producer: any) {
    switch (topic) {
        case "finalise_order":
            const orderCreation = OrderCreation.isOrderCreation(message);

            produceError(orderCreation, producer, topic + "_error", function () {
                const request: OrderCreation = message as OrderCreation;
                saveDeliveryCreation(request);

            });
            break;
        case "order_cooked":
            const id: string = message.id;
            mongoUpdate("COOKED", id, function (status: string) {
                console.log("updated :" + status);
            });


    }
}



function saveDeliveryCreation(request: OrderCreation) {
    const m = new myModel({status: "CREATED", id: request.id});
    m.save();
}

function sendError(message: string, res: Response) {
    res.statusCode = 412;
    res.send({error: message});
}
function produceError(status: boolean | string[], produceError: any, topic: string, callIfNoError: () => void) {
    if (status !== true) {
        produceError.send({topic: topic, error: status});
    } else {
        callIfNoError();
    }
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

        res.json({orderId: request.id});
    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    manageErrors(DeliveryStatusRequest.isDeliveryRequest(req.params), res, function () {
        const request: DeliveryStatusRequest = req.params as DeliveryStatusRequest;
        const mongoQuery: DocumentQuery<DeliveryStatus | null, DeliveryStatus> = myModel.findOne({idDelivery: request.id});

        mongoQuery.exec(function (err, deliStatus: DeliveryStatus) {
            if (err) return sendError("Delivery " + request.id + "doesn't exist", res);
            console.log("Status :%s\n ", deliStatus.status);
            res.send({status: deliStatus.status});
        });
    });
};


function mongoUpdate(newStatus: string, id: string, newStatusUpdate: (status: string) => void) {
    const mongoQuery: DocumentQuery<DeliveryStatus | null, DeliveryStatus> = myModel.findOne({idDelivery: id});

    mongoQuery.exec(function (err, deliStatus: DeliveryStatus) {
        if (err) return console.log(err);
        console.log("Status :%s\n ", deliStatus.status);
        deliStatus.status = status;
        deliStatus.history.push({status: deliStatus.status, event: "update-status"});
        deliStatus.save();
        newStatusUpdate(deliStatus.status);
    });
}

export let updateStatus = (req: Request, res: Response) => {
    req.body.id = req.body.id | req.params.id;
    console.log("Receive", req.body);
    manageErrors(DeliveryStatusPostRequest.isDeliveryStatusPostRequest(req.body), res, function () {
        const request: DeliveryStatusPostRequest = req.body as DeliveryStatusPostRequest;
        mongoUpdate(request.status, request.id, res.send);
    });
};



