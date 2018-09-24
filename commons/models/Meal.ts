export interface Meal {
    name: string;
    price: number;
}

export class RealMeal implements Meal {
    name: string;
    price: number;

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price * 100;
    }
}