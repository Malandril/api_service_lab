import { Request, Response } from "express";
import {DeliveryStatusModel} from "../models";
import {IDeliveryStatusModel} from "../models/delivery-status";

const util = require("util");

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
    console.log("coursier notifyOrder received :" + util.inspect(req.body, false, undefined, true /* enable colors */));

    /*const customer = new CustomerModel({name: req.body.customer, address: req.body.customer.address, phone: req.body.customer.phone});
    const meals = [];

    req.body.meals.forEach(meal => {
        const m = new MealModel();
        m.name = meal.name;
        m.price = meal.price;
        m.eta = meal.eta;
        m.category = meal.category;
        meals.push(m);
    });*/

    const ds = new DeliveryStatusModel({ status: "CREATED", order: {client: req.body.client, meals: req.body.meals}, creation: new Date(), history: [] });

    DeliveryStatusModel.create(ds).then((deliveryStatus) => {
        console.log( "order created :", util.inspect({client: req.body.client, meals: req.body.meals}   , false, undefined, true /* enable colors */));
        console.log("POST: " + deliveryStatus);
        res.status(201).json(deliveryStatus);
    });

};

export const getDeliveries = (req: Request, res: Response) => {
    DeliveryStatusModel.find().then((deliveries: IDeliveryStatusModel[]) => {
        res.status(200).json(deliveries);
    });
};

export let deliveryStatus = (req: Request, res: Response) => {
    console.log("coursier deliveryStatus received :" + req);
    DeliveryStatusModel.findById(req.params.id).exec((err, ds) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!ds) {
            res.sendStatus(404);
            return;
        }
        console.log("GET: " + ds);
        res.status(200).json(ds);
    });
};


export let updateStatus = (req: Request, res: Response) => {
    console.log("coursier updateStatus received :" + req);

    DeliveryStatusModel.findByIdAndUpdate(req.params.id, req.body).exec((err, ds) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!ds) {
            res.sendStatus(404);
            return;
        }
        ds.history.push({status: ds.status, event: "update-status"});
        console.log("PUT: " + ds);
        res.status(200).json(ds);
    });

};



