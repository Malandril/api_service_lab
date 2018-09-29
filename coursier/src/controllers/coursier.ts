import { Request, Response } from "express";
import { Customer } from "uberoo-commons";
import { DeliveryStatus } from "../models/delivery-status";
import { OrderCreation } from "../models/request/order-creation-request";
import { DeliveryStatusRequest } from "../models/request/delivery-status-request";
import { DeliveryStatusPostRequest } from "../models/request/delivery-status-post-request";

let orders: DeliveryStatus[] = []; // identified order
let size = 0;

orders = [];

function saveDeliveryCreation(request: OrderCreation) {
    orders[size] = new DeliveryStatus(size, Date.now(), "CREATED");
    size++;
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

        res.json([{orderId: size}]);
    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    manageErrors(DeliveryStatusRequest.isDeliveryRequest(req.params), res, function () {
        const request: DeliveryStatusRequest = req.params as DeliveryStatusRequest;
        if (request.id < size) {
            const status: DeliveryStatus = orders[request.id];
            status.history.push({status: status.status, event: "retrieve-status"});
            res.send({status: status.status});
        } else {
            sendError( "Delivery " + request.id + "doesn't exist", res);
        }
    });
};


export let updateStatus = (req: Request, res: Response) => {
    req.body.id = req.body.id | req.params.id;
    manageErrors(DeliveryStatusPostRequest.isDeliveryStatusPostRequest(req.body), res, function () {
        const request: DeliveryStatusPostRequest = req.body as DeliveryStatusPostRequest;
        if (request.id < size) {
            const status: DeliveryStatus = orders[request.id];
            status.status = request.status;
            status.history.push({status: status.status, event: "update-status"});
            res.send({status: status.status});
        } else {
            sendError( "Delivery " + request.id + "doesn't exist", res);
        }
    });
};



