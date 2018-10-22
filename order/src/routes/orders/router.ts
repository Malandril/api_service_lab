import {Request, Response, Router} from "express";
import {OrderModel} from "../../models";
import {check, validationResult} from "express-validator/check";

const { Kafka, logLevel } = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'order',
});

const router = Router();

const data: { [key: number]: OrderModel; } = {};
let nextId = 0;



const submitOrder = kafka.consumer({ groupId: 'submit_order' });
const paymentFailed = kafka.consumer({ groupId: 'payment_failed' });
const paymentSucceeded = kafka.consumer({ groupId: 'payment_succeeded' });
const paymentNotNeeded = kafka.consumer({ groupId: 'payment_not_needed' });
const createOrderRequest = kafka.consumer({ groupId: 'create_order_request' });
const assignDelivery = kafka.consumer({ groupId: 'assign_delivery' });
const mealCooked = kafka.consumer({ groupId: 'meal_cooked' });
const orderDelivered = kafka.consumer({ groupId: 'order_delivered' });
const consumers = [submitOrder, paymentFailed, paymentSucceeded, paymentNotNeeded, createOrderRequest, assignDelivery, mealCooked, orderDelivered];
const producer = kafka.producer();

const TOPICS = Object.freeze({"create_order":1, "finalise_order":2});
const run = async () => {
    await producer.connect();
    await consumers.forEach(function (consumer) {
        consumer.connect();
        consumer.connect(consumer.groupId);
    });
    /*
    await finaliseOrder.run({
        eachMessage: async({topic, partition, message}) => {
            console.log(util.inspect(message.value.toString(), {showHidden: false, depth: null}));
            console.log((util.inspect(mongoHelper)));
            methods.addOrder(message.value.toString(),mongoHelper.db);
        }
    })
    */


};


/**
 * GET /orders
 * Return the list of orders offered by Uberoo
 */
const getOrders = (req: Request, res: Response) => {
    res.status(200).send(Object.keys(data).map(key => data[+key]));
};
router.get("/", getOrders);

/**
 * GET /orders/:orderId
 * Return the specified order
 */
const getOrder = (req: Request, res: Response) => {
    const o = data[+req.params.orderId];
    console.log("Getting order", o);
    if (o === undefined) {
        res.status(404);
    } else {
        res.status(200).send(o);
    }
};
router.get("/:orderId", getOrder);

/**
 * POST /orders
 * Create the specified order
 */
const postOrder = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const o = new OrderModel({"client": req.body.client, "meals": req.body.meals, "id": nextId});
    data[nextId++] = o;
    console.log("adding order", o);
    res.status(201).json(o);
};
router.post("/", [
        check("client").isInt().withMessage("An order needs a client id"),
        check("meals").isArray(),
    ]
    , postOrder);

/**
 * DELETE /orders/:orderId
 * Delete the specified order
 */
const deleteOrder = (req: Request, res: Response) => {
    const o = data[req.params.orderId];
    if (o === undefined) {
        res.status(404);
    } else {
        delete data[req.params.orderId];
        res.status(200).send(o);

    }
};
router.delete("/:orderId", deleteOrder);

/**
 * PUT /orders/:orderId
 * Update the specified order
 */
const putOrder = (req: Request, res: Response) => {
    const o = data[+req.params.orderId];
    if (o === undefined) {
        res.status(404);
    } else {
        o.client = req.body.client;
        o.meals = req.body.meals;
        res.status(200).send(o);
    }
};
router.put("/:orderId", putOrder);


export default router;