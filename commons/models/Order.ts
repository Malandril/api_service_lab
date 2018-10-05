import { Meal } from "./Meal";

export interface Order {
    client: number;
    meals: Meal[];
}