import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangePasswordRequestDto } from '../../../models/change-password-request-dto';
import { CustomValidators } from '../../../custom-validators';
import { User } from '../../../models/user';

declare var $: any;

@Component({
  selector: 'app-change-password-form',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password-form-component.html',
})
export class ChangePasswordFormComponent implements OnInit {

  @Input() user: User | null = null;
  @Output() changePassword = new EventEmitter<ChangePasswordRequestDto>();

  form!: FormGroup;

  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group (
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators : CustomValidators.passwordConfirmed }
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: ChangePasswordRequestDto = {
      newPassword: this.form.get('newPassword')?.value
    };
    console.log(dto); 
    this.changePassword.emit(dto);
    this.resetFormAndModal();
  }

  resetFormAndModal(): void {
    this.form.reset({
      newPassword: '',
      confirmPassword: ''
    })
  }

  c(name: string) {
    return this.form.get(name);
  }

  closeChangePasswordModal(): void {
    $('#changePasswordModal').modal('hide');
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

}
