import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidators {


    /** Precio debe ser mayor o igual al costo */
    static priceGteCost: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const cost = group.get('cost')?.value;
        const price = group.get('price')?.value;
        if (cost == null || price == null) return null;
        return Number(price) >= Number(cost) ? null: { priceLtCost: true };
    };

    /** Stock nuevo no puede ser negativo */
    static nonNegativeStock: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const newStock =  group.get('newStock')?.value;
        if (newStock == null) return null;
        return newStock >= 0? null : { negativeStock: true };
    };

    /** Cantidad debe ser distinta de 0 */
    static nonZeroQuantity(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        return value && value != 0 ? null : { zeroQuantity: true };
    }

}