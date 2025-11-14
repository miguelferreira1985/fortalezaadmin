import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { RoleNamePipe } from '../../shared/pipes/role-name-pipe';
import { ChangePasswordRequestDto } from '../../models/change-password-request-dto';
import { ChangePasswordFormComponent } from '../forms/change-password-form-component/change-password-form-component';
import { UserFormComponent } from "../forms/user-form-component/user-form-component";
import { EmployeeService } from '../../services/employee.service';
import { CreateUserForEmployeeEvent } from '../../models/create-user-for-employee-event';
import { UpdateRolesFormComponent } from "../forms/update-roles-form-component/update-roles-form-component";
import { UpdateRolesRequestDto } from '../../models/update-roles-requets-dto';
import { OrderByPipe } from '../../shared/pipes/order-by-pipe';

declare var $: any;

@Component({
  selector: 'app-user-component',
  imports: [
    CommonModule,
    FormsModule,
    FilterByPipe,
    RoleNamePipe,
    ChangePasswordFormComponent,
    UserFormComponent,
    UpdateRolesFormComponent,
    OrderByPipe
],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css'
})
export class UserComponent implements OnInit {

  @ViewChild('changePasswordModal') changePasswordFormModal!: ChangePasswordFormComponent;
  @ViewChild('updateRolesModal') updateRolesFormModal!: UpdateRolesFormComponent;

  users: User[] = [];
  selectedUser: User | null = null;
  searchTerm: string = '';
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc'; 

  constructor(
    private userService: UserService, 
    private employeeService: EmployeeService,
    private notify: NotificationService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  onToggleChange(): void {
    this.getUsers();
  }

  openChangePasswordModal(user: User) {
    this.selectedUser = user;
    $('#changePasswordModal').modal('show');
  }

  openUserModal() {
    $('#userModal').modal('show');
  }

  openUpdateRolesModal(user: User) {
    this.selectedUser = user;
    $('#updateRolesModal').modal('show');
  }

  closeChangePasswordModal(): void {
    $('#changePasswordModal').modal('hide');
  }

  closeUserModal(): void {
    $('#userModal').modal('hide');
  }

  closeUpdateRolesModal(): void {
    $('#updateRolesModal').modal('hide');
  }

  changeSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'fa fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  onUserSaved(user: CreateUserForEmployeeEvent): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres agregar el usuario "${user.user.username}"?`)
    .then((result) => {
      if (result.isConfirmed) {
        this.employeeService.createUserForEmployee(user.employeeId, user.user).subscribe({
          next: (res) => {
            this.getUsers();
            this.notify.success('¡Usuario creado!', res?.message);
            this.closeUserModal();
          },
          error(err) {
            console.error(err);
          }
        });
      }
    });
  }

  onChangePassword(user: User, changePasswordRequestDto: ChangePasswordRequestDto): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres cambiar la contraseña de el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.changePassword(id, changePasswordRequestDto).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('!Contraseña actualizada!');
              this.closeChangePasswordModal();
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  desactivateUser(user: User): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres desactivar el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.desactivateUser(id).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('!Usuario descativado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  activateUser(user: User): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres activar el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.activateUser(id).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('¡Usuario activado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  unblockUser(user: User): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres desbloquear el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.unblockUser(id).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('¡Usuario desbloqueado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  onUpdateRoles(user: User, updateRolesRequest: UpdateRolesRequestDto): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres actualizar los permisos de el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.updateRoles(id, updateRolesRequest).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('Permisos del Usuario Actualizados!');
              this.closeUpdateRolesModal();
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  deleteUser(user: User): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar el usuario "${user.username}? Esta acción es irreversible."`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.deleteUser(id).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('Usuario eliminad0!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByUser(index: number, item: User): number {
    return item.id ?? index;
  }
}
