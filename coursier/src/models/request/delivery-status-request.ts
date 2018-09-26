export class DeliveryStatusRequest {
    id: number;
    constructor(id: number) {
        this.id = id;

    }
    public static isDeliveryRequest(obj: any) {
        const errors: string[] = [];
        if (!("id" in obj ) ) {
            errors.push("'id' needed.");
        } else if (obj.id < 0) {
            errors.push("'id' should not be positive");
        }
        return (errors.length === 0 ? true : errors);
    }
}