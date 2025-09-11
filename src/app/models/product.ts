export interface Product {
    id?: number;
    name: string;
    code: string;
    description: string;
    price: number;
    cost: number;
    stock: number;
    minimumStock: number;
    recommendedStock: number;
    subcategoryId: number;
    subcategoryName?: string;
    supplierIds: number[];
    supplierNames?: string[];
    isActivate?: boolean;
    createdDateTime?: Date;
    updatedDateTime?: Date;
    createdBy?: string;
    updatedBy?: string;
    profitMargin?: number;
    profitValue?: number;
    inventoryValue?: number;
    isBelowOrEqualMinimumStock?: boolean;
}
