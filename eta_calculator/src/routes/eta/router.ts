import { Request, Response, Router } from "express";
import {MealsListModel} from "../../models/MealsListModel";

const {check, validationResult} = require("express-validator/check");
const router = Router();

const data = [42, 24];


/**
 * GET /eta/:mealId
 * Return the ETA for the specified meal
 */
const getETAForMeal = (req: Request, res: Response) => {
    res.json(data[req.params.mealId]);
};
router.get("/:mealId", getETAForMeal);


/**
 * POST /eta
 * Create the specified meal
 */
const postEta = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const meals = new MealsListModel(
        {"client": 2,
            "meals": [
                {"name": "Lol", "price": 12}, {"name": "Lol", "price": 12}
            ]
        });
    // const o = new MealModel({"name": req.body.name, "price": +req.body.price, "id": nextId});
    // data[nextId++] = o;
    // res.status(201).json(o);
};

function getMealValidator() {
    return [
        check("name").isString().isLength({min: 1}).withMessage("A meal needs a name"),
        check("price").isFloat({gt: 0}).withMessage("A meal needs a price greater than 0")
    ];
}


export default router;