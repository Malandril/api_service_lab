import { Customer } from "../customer";
import { Order } from "../order";

export class OrderCreation {
    order: Order;
    customer: Customer;
    constructor(order: Order, customer: Customer) {
        this.order = order;
        this.customer = customer as Customer;

    }
    public static isOrderCreation(obj: any) {
        const errors: string[] = [];
        /* if (!("id" in obj ) ) {
            errors.push("'id' needed.");
        } */
        if (! ("customer" in obj)) {
            console.log("customer needed");
        }
        return (errors.length === 0 ? true : errors);
    }
}