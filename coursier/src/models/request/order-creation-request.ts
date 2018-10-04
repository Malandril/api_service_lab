import { Customer } from "../customer";

export class OrderCreation {
    id: number;
    customer: Customer;
    constructor(id: number, customer: Customer) {
        this.id = id;
        this.customer = customer as Customer;

    }
    public static isOrderCreation(obj: any) {
        const errors: string[] = [];
        if (!("id" in obj ) ) {
            errors.push("'id' needed.");
        }
        if (! ("customer" in obj)) {
            console.log("customer needed");
        }
        return (errors.length === 0 ? true : errors);
    }
}