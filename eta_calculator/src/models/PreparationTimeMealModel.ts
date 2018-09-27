import { Meal } from "../../../commons/models";

export class PreparationTimeMealModel implements Meal {
    name: string;
    price: number;
    time_to_prepare: number;

    constructor(meal: Meal, time_to_prepare: number) {
        this.name = meal.name;
        this.price = meal.price;
        this.time_to_prepare = time_to_prepare;
    }
}