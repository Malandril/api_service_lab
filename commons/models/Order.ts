import { Meal } from "./Meal";
import {Customer} from "./Customer";

export interface Order {
    client: Customer;
    meals: Meal[];
}