import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { User } from '../../../models/user';
import { UserRequestDto } from '../../../models/user-request-dto';
import { UpdateRolesRequestDto } from '../../../models/update-roles-requets-dto';
import { CustomValidators } from '../../../custom-validators';

@Component({
  selector: 'app-update-roles-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './update-roles-form-component.html',
  styleUrl: './update-roles-form-component.css'
})
export class UpdateRolesFormComponent implements OnInit, OnChanges {

  @Input() user: User | null = null;
  @Output() updateRoles = new EventEmitter<UpdateRolesRequestDto>();

  form!: FormGroup;
  roles = [
    { id: 'cashier', name: 'Cajero'},
    { id: 'manager', name: 'Gerente'},
    { id: 'admin', name: 'Administrador'}
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group ({
      roles: [[]]
    },
    { validators : CustomValidators.minSelected(1) });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      const selectedIds = this.mapUserRolesToIds(this.user.roles);
      this.form?.patchValue({ roles: selectedIds });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: UpdateRolesRequestDto = {
      roles: this.c('roles')?.value ?? []
    };
    this.updateRoles.emit(dto);
  }

  resetFormAndModal(): void {
    this.form.reset({
      roles: []
    })
  }

  c(name: string) {
    return this.form.get(name);
  }

  closeUpdateRolesModal(): void {
    $('#updateRolesModal').modal('hide');
  }

  private mapUserRolesToIds(userRoles: any): string[] {
    if (!Array.isArray(userRoles)) return [];
  
    const mapNameToId: Record<string, string> = {
      'ROLE_ADMIN': 'admin',
      'ROLE_MANAGER': 'manager',
      'ROLE_CASHIER': 'cashier'
    };
  
    if (typeof userRoles[0] === 'string') {
      return userRoles.map(r => mapNameToId[r] ?? r);
    }

    return userRoles
      .map((r: any) => mapNameToId[r?.name])
      .filter((v: any): v is string => !!v);
  }
}
