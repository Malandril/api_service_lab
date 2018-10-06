import {Request, Response, Router} from "express";
import {OrderToPrepareModel} from "../../models";
import {IOrderToPrepareModel} from "../../models/OrderToPrepareModel";

const {check, validationResult} = require("express-validator/check");

const router = Router();


/**
 * GET /orderToPrepares
 * Return the list of orderToPrepares offered by Uberoo
 */
const getOrderToPrepares = (req: Request, res: Response) => {
    OrderToPrepareModel.find().then((orderToPrepares: IOrderToPrepareModel[]) => {
        res.status(200).json(orderToPrepares);
    });

};
router.get("/", getOrderToPrepares);

/**
 * GET /orderToPrepares/:orderToPrepareId
 * Return the specified orderToPrepare
 */
const getOrderToPrepare = (req: Request, res: Response) => {
    OrderToPrepareModel.findById(req.params.orderToPrepareId).exec((err, orderToPrepare) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!orderToPrepare) {
            res.sendStatus(404);
            return;
        }
        console.log("GET: " + orderToPrepare);
        res.status(200).json(orderToPrepare);
    });
};
router.get("/:orderToPrepareId", getOrderToPrepare);

/**
 * POST /orderToPrepares
 * Create the specified orderToPrepare
 */
const postOrderToPrepare = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const m = new OrderToPrepareModel();
    m.client = req.body.client;
    m.meals = req.body.meals;

    OrderToPrepareModel.create(m).then((orderToPrepare) => {
        console.log("POST: " + orderToPrepare);
        res.status(201).json(orderToPrepare);
    });
};

function getOrderToPrepareValidator() {
    return [
        check("client").exists().withMessage("An orderToPrepare needs a client id"),
        check("meals").isArray(),
    ];
}

router.post("/", getOrderToPrepareValidator(), postOrderToPrepare);

/**
 * DELETE /orderToPrepares/:orderToPrepareId
 * Delete the specified orderToPrepare
 */
const deleteOrderToPrepare = (req: Request, res: Response) => {
    OrderToPrepareModel.findByIdAndRemove(req.params.orderToPrepareId).exec((err, orderToPrepare) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!orderToPrepare) {
            res.sendStatus(404);
            return;
        }
        console.log("DELETE: " + orderToPrepare);
        res.status(200).json(orderToPrepare);
    });
};
router.delete("/:orderToPrepareId", deleteOrderToPrepare);

/**
 * PUT /orderToPrepares/:orderToPrepareId
 * Update the specified orderToPrepare
 */
const putOrderToPrepare = (req: Request, res: Response) => {
    OrderToPrepareModel.findByIdAndUpdate(req.params.orderToPrepareId, req.body).exec((err, orderToPrepare) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!orderToPrepare) {
            res.sendStatus(404);
            return;
        }
        console.log("PUT: " + orderToPrepare);
        res.status(200).json(orderToPrepare);
    });
};
router.put("/:orderToPrepareId", getOrderToPrepareValidator(), putOrderToPrepare);


export default router;