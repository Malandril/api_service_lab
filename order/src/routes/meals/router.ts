import { Request, Response, Router } from "express";
import { MealModel } from "../../models";

const router = Router();

const data = [new MealModel({"name": "Pizza", "price": 8}), new MealModel({"name": "Pasta", "price": 3})];

/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
const getMeals = (req: Request, res: Response) => {
    res.json(data);
};
router.get("/", getMeals);

/**
 * GET /meals/:mealId
 * Return the specified meal
 */
const getMeal = (req: Request, res: Response) => {
    res.json(data[req.params.mealId]);
};
router.get("/:mealId", getMeal);

// Not sure, to be check
const postMeal = (req: Request, res: Response) => {
    console.log(req.body);
    const o = new MealModel({"name": req.body.name, "price": req.body.price});
    data.push(o);
    res.status(201).send(o);
};
router.post("/", postMeal);

export default router;