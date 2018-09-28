import { Request, Response, Router } from "express";
import { MealModel } from "../../models";

const router = Router();

const data: { [key: number]: MealModel; } = {0: new MealModel({"name": "Pizza", "price": 8, "id": 0}), 1: new MealModel({"name": "Pasta", "price": 3, "id": 1})};
let nextId = 2;

/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
const getMeals = (req: Request, res: Response) => {
    res.status(200).send(Object.keys(data).map(key => data[+key]));
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
    const o = new MealModel({"name": req.body.name, "price": +req.body.price, "id": nextId});
    data[nextId++] = o;
    res.status(201).send(o);
};
router.post("/", postMeal);

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
    const o = data[+req.params.mealId];
    if (o === undefined) {
        res.status(404);
    } else {
        o.name = req.body.name;
        o.price = +req.body.price;
        res.status(200).send(o);
    }
};
router.put("/:mealId", putMeal);


export default router;