export interface IDeliveryStatus {
    idStatus: number;
    creation: Date;
    status: string;
    history: {status: string, event: string}[];
}