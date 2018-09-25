export interface Customer {
    id: number;
    address: string;
}

export class CustomerImpl implements Customer {
    address: string;
    id: number;


    constructor(id: number, address: string) {
        this.address = address;
        this.id = id;
    }
}