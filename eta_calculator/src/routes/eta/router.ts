import { Request, Response, Router } from "express";

const {check, validationResult} = require("express-validator/check");
const router = Router();


/**
 * POST /eta
 * Calculate the total ETA for the specified meals
 */
const postEta = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let totalETA = 0;
    const order = req.body.order;
    for (let i = 0; i < order.meals.length; i++) {
        totalETA += +order.meals[i].eta;
    }
    res.status(200).json(totalETA);
};

router.post("/", postEta);


export default router;