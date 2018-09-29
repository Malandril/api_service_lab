import { MealModel } from "./MealModel";
import { Order } from "../../../commons/models";

export class OrderModel implements Order {
    id: number;
    client: number;
    meals: MealModel[];

    constructor(order: Order) {
        this.id = order.id;
        this.client = order.client;
        this.meals = order.meals;
    }
}