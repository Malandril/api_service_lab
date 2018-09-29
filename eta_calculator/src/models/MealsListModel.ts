import {Meal, MealsList} from "../../../commons/models";

export class MealsListModel implements MealsList {
    client: number;
    meals: Meal[];

    constructor(mealsList: MealsList) {
        this.client = mealsList.client;
        this.meals = mealsList.meals;
    }
}