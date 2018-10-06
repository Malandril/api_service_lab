export interface IDeliveryStatus {
    order: {id: string};
    creation: Date;
    status: string;
    history: {status: string, event: string}[];
}