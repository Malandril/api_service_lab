import {Request, Response, Router} from "express";
import {MealModel} from "../../models";

const {check, validationResult} = require("express-validator/check");

const router = Router();

const data: { [key: number]: MealModel; } = {
    0: new MealModel({"name": "Pizza", "price": 8, "id": 0, "eta": 12, "category": "Italian"}),
    1: new MealModel({"name": "Pasta", "price": 3, "id": 1, "eta": 10, "category": "Italian"}),
    2: new MealModel({"name": "Ramen soup", "price": 2, "id": 2, "eta": 7, "category": "Asian"})
};
let nextId = 3;

/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
const getMeals = (req: Request, res: Response) => {
    let meals = Object.keys(data).map(key => data[+key]);
    if (req.query.category) {
        meals = meals.filter(value => value.category.toLowerCase() === req.query.category.toLowerCase());
    }
    res.status(200).send(meals);

};
router.get("/", getMeals);

/**
 * GET /meals/:mealId
 * Return the specified meal
 */
const getMeal = (req: Request, res: Response) => {
    const o = data[+req.params.mealId];
    if (o === undefined) {
        res.status(404);
    } else {
        res.status(200).send(o);
    }
};
router.get("/:mealId", getMeal);

/**
 * POST /meals
 * Create the specified meal
 */
const postMeal = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const o = new MealModel({
        "name": req.body.name,
        "price": +req.body.price,
        "id": nextId,
        "eta": +req.body.eta,
        "category": req.body.category
    });
    data[nextId++] = o;
    res.status(201).json(o);
};

function getMealValidator() {
    return [
        check("name").isString().isLength({min: 1}).withMessage("A meal needs a name"),
        check("price").isFloat({gt: 0}).withMessage("A meal needs a price greater than 0"),
        check("category").isString().isLength({min: 1}).withMessage("A meal needs a category")
    ];
}

router.post("/", getMealValidator(), postMeal);

/**
 * DELETE /meals/:mealId
 * Delete the specified meal
 */
const deleteMeal = (req: Request, res: Response) => {
    const o = data[req.params.mealId];
    if (o === undefined) {
        res.status(404);
    } else {
        delete data[req.params.mealId];
        res.status(200).send(o);

    }
};
router.delete("/:mealId", deleteMeal);

/**
 * PUT /meals/:mealId
 * Update the specified meal
 */
const putMeal = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const o = data[+req.params.mealId];
    if (o === undefined) {
        res.status(404);
    } else {
        o.name = req.body.name;
        o.price = +req.body.price;
        res.status(200).send(o);
    }
};
router.put("/:mealId", getMealValidator(), putMeal);


export default router;