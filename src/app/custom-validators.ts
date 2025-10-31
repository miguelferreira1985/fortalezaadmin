import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { grep } from "jquery";

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
    };

    /** Confirm password */
    static passwordConfirmed: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const newCtrl = group.get('newPassword');
        const confCtrl = group.get('confirmPassword');
    
        const newVal = newCtrl?.value;
        const confVal = confCtrl?.value;
    
        if (!newVal || !confVal) {
          if (confCtrl?.hasError('passwordMismatch')) {
            const { passwordMismatch, ...rest } = confCtrl.errors ?? {};
            confCtrl.setErrors(Object.keys(rest).length ? rest : null);
          }
          return null;
        }
    
        const mismatch = newVal !== confVal;
    
        if (confCtrl) {
          const existing = confCtrl.errors ?? {};
          if (mismatch) {
            confCtrl.setErrors({ ...existing, passwordMismatch: true });
          } else if ('passwordMismatch' in existing) {
            const { passwordMismatch, ...rest } = existing;
            confCtrl.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
    
        return mismatch ? { passwordMismatch: true } : null;
      };
    
}