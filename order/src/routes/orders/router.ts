import {Request, Response, Router} from "express";
import {OrderModel} from "../../models";
import {check, validationResult} from "express-validator/check";

const data: { [key: number]: OrderModel; } = {};
let nextId = 0;

/**
 * GET /orders
 * Return the list of orders offered by Uberoo
 */
const getOrders = (req: Request, res: Response) => {
    res.status(200).send(Object.keys(data).map(key => data[+key]));
};

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
// route
// r.get("/:orderId", getOrder);

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
/*router.post("/", [
        check("client").isInt().withMessage("An order needs a client id"),
        check("meals").isArray(),
    ]
    , postOrder);

    */

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
// router.delete("/:orderId", deleteOrder);

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
// router.put("/:orderId", putOrder);


module.exports = {
    putOrder: putOrder,
    postOrder: postOrder
};
