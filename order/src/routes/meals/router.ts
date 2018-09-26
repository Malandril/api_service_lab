import { Request, Response, Router } from "express";
import { MealModel } from "../../models";

const router = Router();

const data: { [key: number]: MealModel; } = {0: new MealModel({"name": "Pizza", "price": 8}), 1: new MealModel({"name": "Pasta", "price": 3})};
let nextId = 2;

/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
const getMeals = (req: Request, res: Response) => {
    res.status(200).send(data);
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

const postMeal = (req: Request, res: Response) => {
    const o = new MealModel({"name": req.body.name, "price": +req.body.price});
    data[nextId++] = o;
    res.status(201).send(o);
};
router.post("/", postMeal);

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


export default router;