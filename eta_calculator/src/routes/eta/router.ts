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
    for (let i = 0; i < req.body.meals.length; i++) {
        totalETA += +req.body.meals[i].eta;
    }
    res.status(200).json(totalETA);
};

function getETAValidator() {
    return [
        check("meals").isArray().isLength({min: 1}).withMessage("The request must contains at least one meal")
    ];
}

router.post("/", getETAValidator(), postEta);


export default router;