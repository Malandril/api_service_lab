import { Request, Response } from "express";
import { MealModel } from "../models/MealModel";

/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
export let getMeals = (req: Request, res: Response) => {
    res.json([new MealModel({"name": "Pizza", "price": 8}), new MealModel({"name": "Pasta", "price": 3})]);
};
