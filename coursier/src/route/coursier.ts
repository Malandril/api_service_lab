import { Request, Response } from "express";
import { DeliveryStatus } from "../models/delivery-status";
import { OrderCreation } from "../models/request/order-creation-request";
import { DeliveryStatusRequest } from "../models/request/delivery-status-request";
import { DeliveryStatusPostRequest } from "../models/request/delivery-status-post-request";
import {DocumentQuery} from "mongoose";

const mongoose = require("mongoose");
const util = require("util");

const myModel = mongoose.model("DeliveryStatus");
function saveDeliveryCreation(request: OrderCreation) {

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
    console.log("coursier notifyOrder received :" + util.inspect(req.body, false, null, true /* enable colors */));
    const orderCreation = OrderCreation.isOrderCreation(req.body);
    console.log("isOrderCreation :" , util.inspect(orderCreation, false, null, true /* enable colors */));
    manageErrors(orderCreation, res, function () {

        const m = new myModel({status: "CREATED", order: req.body.order, customer: req.body.customer, creation: new Date(), history: []} );


        myModel.create(m).then((order) => {
            console.log( "order created :", util.inspect(order, false, null, true /* enable colors */));
            res.json({orderId: order._id});
        });


    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    console.log("coursier deliveryStatus received :" + req);
    manageErrors(DeliveryStatusRequest.isDeliveryRequest(req.params), res, function () {
        const request: DeliveryStatusRequest = req.params as DeliveryStatusRequest;
        myModel.findOne({order: {id:  request.id}}, function (err, deliStatus: DeliveryStatus) {
            if (err) return  sendError( "Delivery " + request.id + "doesn't exist", res);
            console.log("Status :%s\n ", deliStatus);
            res.send({status: deliStatus.status});
        });
    });
};


export let updateStatus = (req: Request, res: Response) => {
    console.log("coursier updateStatus received :" + req);
    req.body.id = req.body.id | req.params.id;
    console.log("Receive", req.body);
    manageErrors(DeliveryStatusPostRequest.isDeliveryStatusPostRequest(req.body), res, function () {
        const request: DeliveryStatusPostRequest = req.body as DeliveryStatusPostRequest;
        myModel.findOne({order: {id:  request.id}}, function (err, deliStatus: DeliveryStatus) {
            if (err) return console.log(err);
            console.log("Status :%s\n ", deliStatus.status);
            deliStatus.status = request.status;
            deliStatus.history.push({status: deliStatus.status, event: "update-status"});
            deliStatus.save();
            res.send({status: deliStatus.status});
        });
    });
};



