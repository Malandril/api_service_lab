import { Request, Response } from "express";
import { Customer } from "uberoo-commons";
import { DeliveryStatus } from "../models/delivery-status";
import { OrderCreation } from "../models/request/order-creation-request";
import { DeliveryStatusRequest } from "../models/request/delivery-status-request";

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
        console.log("Adding 2 " + JSON.stringify(request));
        for (const property in request) {
            console.log("has property " + property);
        }
        saveDeliveryCreation(request);

        res.json([{orderId: size}]);
    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    manageErrors(DeliveryStatusRequest.isDeliveryRequest(req.query), res, function () {
        const request: DeliveryStatusRequest = req.body as DeliveryStatusRequest;
        if (request.id < size) {
            const status: DeliveryStatus = orders[request.id];
            status.history.push({status: status.status, event: "retrieve-status"});
            res.send({status: status.status});
        } else {
            sendError( "id doesn't exist", res);
        }
    });
};


