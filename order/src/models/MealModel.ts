import { Meal } from "uberoo-commons";

export class MealModel implements Meal {
    name: string;
    price: number;

    constructor(meal: Meal) {
        this.name = meal.name;
        this.price = meal.price;
    }
}