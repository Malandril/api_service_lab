import { Request, Response, Router } from "express";
import { OrderToPrepareModel } from "../../models";

const router = Router();

const data: { [key: number]: OrderToPrepareModel; } = {};
let nextId = 0;

/**
 * GET /ordersToPrepare
 * Return the list of orderToPrepareId offered by Uberoo
 */
const getOrderToPrepares = (req: Request, res: Response) => {
    res.status(200).send(Object.keys(data).map(key => data[+key]));
};
router.get("/", getOrderToPrepares);

/**
 * GET /ordersToPrepare/:orderToPrepareId
 * Return the specified order-to-prepare
 */
const getOrderToPrepare = (req: Request, res: Response) => {
    const o = data[+req.params.orderToPrepareId];
    if (o === undefined) {
        res.status(404);
    } else {
        res.status(200).send(o);
    }
};
router.get("/:orderToPrepareId", getOrderToPrepare);

/**
 * POST /ordersToPrepare
 * Create the specified order-to-prepare
 */
const postOrderToPrepare = (req: Request, res: Response) => {
    const o = new OrderToPrepareModel({"client": req.body.client, "meals": req.body.meals, "id": nextId});
    data[nextId++] = o;
    res.status(201).send(o);
};
router.post("/", postOrderToPrepare);

/**
 * DELETE /ordersToPrepare/:orderToPrepareId
 * Delete the specified order-to-prepare
 */
const deleteOrderToPrepare = (req: Request, res: Response) => {
    const o = data[req.params.orderToPrepareId];
    if (o === undefined) {
        res.status(404);
    } else {
        delete data[req.params.orderToPrepareId];
        res.status(200).send(o);

    }
};
router.delete("/:orderToPrepareId", deleteOrderToPrepare);

/**
 * PUT /ordersToPrepare/:orderToPrepareId
 * Update the specified order-to-prepare
 */
const putOrderToPrepare = (req: Request, res: Response) => {
    const o = data[+req.params.orderToPrepareId];
    if (o === undefined) {
        res.status(404);
    } else {
        o.client = req.body.client;
        o.meals = req.body.meals;
        res.status(200).send(o);
    }
};
router.put("/:orderToPrepareId", putOrderToPrepare);


export default router;