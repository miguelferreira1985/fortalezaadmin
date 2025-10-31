import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Employee } from '../../../models/employee';
import { EmployeeRequestDto } from '../../../models/employee-request-dto';
import { UserRequestDto } from '../../../models/user-request-dto';

@Component({
  selector: 'app-employee-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './employee-form-component.html',
  styleUrl: './employee-form-component.css'
})
export class EmployeeFormComponent implements OnInit, OnChanges {

  @Input() employee: Employee | null = null;
  @Output() saveEmployee = new EventEmitter<EmployeeRequestDto>();

  form!: FormGroup;
  createUser: boolean = false;
  roles = [
    { id: 'cashier', name: 'Cajero'},
    { id: 'manager', name: 'Gerente'},
    { id: 'admin', name: 'Administrador'}
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [''],
      email: [''],
      phone: ['', Validators.required],
      ssn: [''],
      username: [''],
      password: [''],
      roles: [[]],
      createUser: [false]
    });

    this.applyUserValidators(this.c('createUser').value === true);

    this.c('createUser').valueChanges.subscribe((checked: boolean) => {
      this.applyUserValidators(checked);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && changes['employee'].currentValue) {
      const e = changes['employee'].currentValue as Employee;
      this.form.patchValue({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        address: e.address,
        email: e.email,
        phone: e.phone,
        ssn: e.ssn,
        username: null,
        password: null,
        roles: [],
        createUser: false
      });

      this.applyUserValidators(false);
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const userDto: UserRequestDto = {
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value,
      roles: this.form.get('roles')?.value
    }
    const dto: EmployeeRequestDto = {
      id: this.form.get('id')?.value,
      firstName: this.form.get('firstName')?.value,
      lastName: this.form.get('lastName')?.value,
      address: this.form.get('address')?.value,
      email: this.form.get('email')?.value,
      phone: this.form.get('phone')?.value,
      ssn: this.form.get('ssn')?.value,
      userRequestDTO: this.c('createUser').value ? userDto : null
    };
    console.log('Employee to send:', dto);
    this.saveEmployee.emit(dto)
  }

  closeEmployeeForm(): void {
    $('#employeeModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      phone: '',
      ssn: '',
      username: null,
      password: null,
      roles: []
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

  private applyUserValidators(enabled: boolean): void {
    const username = this.c('username');
    const password = this.c('password');
    const roles    = this.c('roles');
  
    if (enabled) {
      username.setValidators([Validators.required]);
      password.setValidators([Validators.required, Validators.minLength(8)]);
      roles.setValidators([Validators.required]);
    } else {
      username.clearValidators();
      password.clearValidators();
      roles.clearValidators();
  
      username.setValue('');
      password.setValue('');
      roles.setValue([]);
    }
  
    username.updateValueAndValidity({ emitEvent: false });
    password.updateValueAndValidity({ emitEvent: false });
    roles.updateValueAndValidity({ emitEvent: false });
  }

}
