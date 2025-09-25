export interface Client {
    id?: number;
    companyName?: string;
    firstName: string;
    lastName: string;
    address?: string;
    email?: string;
    phone?: string;
    rfc: string;
    isActivate?: boolean;
    createdDateTime?: Date;
    updatedDateTime?: Date;
    createdBy?: string;
    updatedBy?: string;
}
