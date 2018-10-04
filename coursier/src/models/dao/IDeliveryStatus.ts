export interface IDeliveryStatus {
    idDelivery: number;
    creation: Date;
    status: string;
    history: {status: string, event: string}[];
}