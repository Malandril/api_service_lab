import { Meal } from "./Meal";

export interface Order {
    id: number;
    client: number;
    meals: Meal[];
}