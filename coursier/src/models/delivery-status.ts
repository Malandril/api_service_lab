export class DeliveryStatus {
    id: number;
    creation: number;
    status: string;
    history: {status: string, event: string}[];


    constructor(id: number, creation: number, status: string) {
        this.id = id;
        this.creation = creation;
        this.status = status;
        this.history = [];
    }
}