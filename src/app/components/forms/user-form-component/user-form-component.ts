import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../services/employee.service';
import { CustomValidators } from '../../../custom-validators';
import { UserRequestDto } from '../../../models/user-request-dto';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { CreateUserForEmployeeEvent } from '../../../models/create-user-for-employee-event';

declare const $: any;

@Component({
  selector: 'app-user-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './user-form-component.html'
})
export class UserFormComponent implements OnInit {

  @Output() createUser = new EventEmitter<CreateUserForEmployeeEvent>();

  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  employees: Array<Employee & { fullName: string }> = [];
  roles = [
    { id: 'cashier', name: 'Cajero'},
    { id: 'manager', name: 'Gerente'},
    { id: 'admin', name: 'Administrador'}
  ];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeId: [null, Validators.required],
      username: [{value: '', disabled: true}, [Validators.required, Validators.minLength(5)]],
      password: [{value: '', disabled: true}, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [{value: '', disabled: true}, [Validators.required]],
      roles: []
    },
    { validators : CustomValidators.matchFields('password', 'confirmPassword')});

    this.getEmployees();

    this.c('employeeId').valueChanges.subscribe(val => {
      if (val) {
        this.enableFields();
      } else {
        this.disableFields();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employeeId = this.c('employeeId').value as number;

    const user: UserRequestDto = {
      username: this.c('username').value,
      password: this.c('password').value,
      roles: this.c('roles').value ?? []
    };

    this.createUser.emit({ employeeId, user });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  closeUserForm(): void {
    $('#userModal').modal('hide');
  }

  private enableFields() {
    const username = this.c('username');
    const password = this.c('password');
    const confirmPassword = this.c('confirmPassword');
    const roles = this.c('roles');

    username.enable();
    password.enable();
    confirmPassword.enable();
    roles.enable();
  }

  private disableFields() {
    const username = this.c('username');
    const password = this.c('password');
    const confirmPassword = this.c('confirmPassword');
    const roles = this.c('roles');

    username.disable();
    password.disable();
    confirmPassword.disable();
    roles.disable();
  }

  private getEmployees(): void {
    this.employeeService.getEmployees(true).subscribe({
      next: (data) => {
        this.employees = (data ?? [])
        .filter(e => !e.user)
        .map(e => ({ ...e, fullName: `${e.firstName} ${e.lastName}`.trim() }));
      },
      error: (error) => {
        console.error('Error al obtener los empleados:', error);
      }
    });
  }

}
