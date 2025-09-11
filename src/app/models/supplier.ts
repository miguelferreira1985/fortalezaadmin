export interface Supplier {
    id?: number;
    name: string;
    contact?: string;
    address?: string;
    email?: string;
    phone?: string;
    productIds?: number[];
    isActivate?: boolean;
    createdDateTime?: Date;
    updatedDateTime?: Date;
    createdBy?: string;
    updatedBy?: string;
}