export interface Subcategory {
    id?: number;
    name: string;
    description?: string;
    categoryId: number;
    productIds?: number[];
    isActivate?: boolean;
    createdDateTime?: Date;
    updatedDateTime?: Date;
    createdBy?: string;
    updatedBy?: string;
}