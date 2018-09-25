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
    data.push(new MealModel(req.body));
};

export default router;