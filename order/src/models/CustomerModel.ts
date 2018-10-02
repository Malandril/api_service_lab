import { Customer } from "uberoo-commons";

export class CustomerModel implements Customer {
    id: number;
    address: string;
    name: string;
    phone: string;

    constructor(customer: Customer) {
        this.id = customer.id;
        this.address = customer.address;
        this.name = customer.name;
        this.phone = customer.phone;
    }
}