import { Meal } from "../../../commons/models";

export class MealModel implements Meal {
    name: string;
    price: number;
    id: number;

    constructor(meal: Meal) {
        this.name = meal.name;
        this.price = meal.price;
        this.id = meal.id;
    }
}