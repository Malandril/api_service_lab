import {Request, Response, Router} from "express";
import {MealModel} from "../../models";
import {IMealModel} from "../../models/MealModel";

const {check, validationResult} = require("express-validator/check");

const router = Router();


/**
 * GET /meals
 * Return the list of meals offered by Uberoo
 */
const getMeals = (req: Request, res: Response) => {
    const category = req.query.category;
    console.log("Query for category: " + category);
    MealModel.find({ category: { $regex : new RegExp(category, "i") } }).then((meals: IMealModel[]) => {
        res.status(200).json(meals);
    });

};
router.get("/", getMeals);

/**
 * GET /meals/:mealId
 * Return the specified meal
 */
const getMeal = (req: Request, res: Response) => {
    MealModel.findById(req.params.mealId).exec((err, meal) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!meal) {
            res.sendStatus(404);
            return;
        }
        console.log("GET: " + meal);
        res.status(200).json(meal);
    });
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
    const m = new MealModel();
    m.name = req.body.name;
    m.price = req.body.price;
    m.eta = req.body.eta;
    m.category = req.body.category;

    MealModel.create(m).then((meal) => {
        console.log("POST: " + meal);
        res.status(201).json(meal);
    });
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
    MealModel.findByIdAndRemove(req.params.mealId).exec((err, meal) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!meal) {
            res.sendStatus(404);
            return;
        }
        console.log("DELETE: " + meal);
        res.status(200).json(meal);
    });
};
router.delete("/:mealId", deleteMeal);

/**
 * PUT /meals/:mealId
 * Update the specified meal
 */
const putMeal = (req: Request, res: Response) => {
    MealModel.findByIdAndUpdate(req.params.mealId, req.body).exec((err, meal) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!meal) {
            res.sendStatus(404);
            return;
        }
        console.log("PUT: " + meal);
        res.status(200).json(meal);
    });
};
router.put("/:mealId", getMealValidator(), putMeal);


export default router;