import { Meal, Order } from "../../../commons/models";

export class OrderToPrepareModel implements Order {
    id: number;
    client: number;
    meals: Meal[];

    constructor(order: Order) {
        this.id = order.id;
        this.client = order.client;
        this.meals = order.meals;
    }
}