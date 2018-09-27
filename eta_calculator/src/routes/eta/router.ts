import { Request, Response, Router } from "express";

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

export default router;