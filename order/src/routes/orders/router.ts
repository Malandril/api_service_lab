import {Request, Response, Router} from "express";
import {OrderModel} from "../../models";
import {IOrderModel} from "../../models/OrderModel";

const {check, validationResult} = require("express-validator/check");

const router = Router();


/**
 * GET /orders
 * Return the list of orders offered by Uberoo
 */
const getOrders = (req: Request, res: Response) => {
    OrderModel.find().then((orders: IOrderModel[]) => {
        res.status(200).json(orders);
    });

};
router.get("/", getOrders);

/**
 * GET /orders/:orderId
 * Return the specified order
 */
const getOrder = (req: Request, res: Response) => {
    OrderModel.findById(req.params.orderId).exec((err, order) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!order) {
            res.sendStatus(404);
            return;
        }
        console.log("GET: " + order);
        res.status(200).json(order);
    });
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
    const m = new OrderModel();
    m.client = req.body.client;
    m.meals = req.body.meals;

    OrderModel.create(m).then((order) => {
        console.log("POST: " + order);
        res.status(201).json(order);
    });
};

function getOrderValidator() {
    return [
        check("client").exists().withMessage("An order needs a client id"),
        check("meals").isArray(),
    ];
}

router.post("/", getOrderValidator(), postOrder);

/**
 * DELETE /orders/:orderId
 * Delete the specified order
 */
const deleteOrder = (req: Request, res: Response) => {
    OrderModel.findByIdAndRemove(req.params.orderId).exec((err, order) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!order) {
            res.sendStatus(404);
            return;
        }
        console.log("DELETE: " + order);
        res.status(200).json(order);
    });
};
router.delete("/:orderId", deleteOrder);

/**
 * PUT /orders/:orderId
 * Update the specified order
 */
const putOrder = (req: Request, res: Response) => {
    OrderModel.findByIdAndUpdate(req.params.orderId, req.body).exec((err, order) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!order) {
            res.sendStatus(404);
            return;
        }
        console.log("PUT: " + order);
        res.status(200).json(order);
    });
};
router.put("/:orderId", getOrderValidator(), putOrder);


export default router;