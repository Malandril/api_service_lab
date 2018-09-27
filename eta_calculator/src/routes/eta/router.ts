import { Request, Response, Router } from "express";
import { PreparationTimeMealModel } from "../../models";

const router = Router();

const data = [new PreparationTimeMealModel({"name": "Pizza", "price": 8}, 42),
    new PreparationTimeMealModel({"name": "Pasta", "price": 3}, 24)];


/**
 * GET /eta/:mealId
 * Return the ETA for the specified meal
 */
const getETAForMeal = (req: Request, res: Response) => {
    res.json(data[req.params.mealId].time_to_prepare);
};
router.get("/:mealId", getETAForMeal);

export default router;