export class DeliveryStatusPostRequest {
    id: string;
    status: string;
    public static isDeliveryStatusPostRequest(obj: any) {
        const errors: string[] = [];
        if (!("id" in obj ) ) {
            errors.push("'id' needed.");
        } else if (obj.id < 0) {
            errors.push("'id' should not be positive");
        }
        if (!("status" in obj ) ) {
            errors.push("'status needed.");
        }
        return (errors.length === 0 ? true : errors);
    }
}