import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { BooleanToTextPipe } from '../../shared/pipes/booelean-to-text-pipe';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { RoleNamePipe } from '../../shared/pipes/role-name-pipe';
import { ChangePasswordRequestDto } from '../../models/change-password-request-dto';
import { ChangePasswordFormComponent } from '../forms/change-password-form-component/change-password-form-component';

declare var $: any;

@Component({
  selector: 'app-user-component',
  imports: [
    CommonModule,
    FormsModule,
    FilterByPipe,
    BooleanToTextPipe,
    RoleNamePipe,
    ChangePasswordFormComponent
],
  templateUrl: './user-component.html'
})
export class UserComponent implements OnInit {

  @ViewChild('changePasswordModal') changePasswordFormModal!: ChangePasswordFormComponent;

  users: User[] = [];
  selectedUser: User | null = null;
  searchTerm: string = '';
  showActiveProducts: boolean = true;

  constructor(private userService: UserService, private notify: NotificationService) {}

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

  closeChangePasswordModal(): void {
    $('#changePasswordModal').modal('hide');
  }

  getUsers(): void {
    this.userService.getUsers(this.showActiveProducts).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  onChangePassword(user: User, changePasswordRequestDto: ChangePasswordRequestDto): void {
    console.log('password recibido en el componente', changePasswordRequestDto);
    this.notify.confirm('¿Estás seguro?', `¿Quieres cambiar la contraseña de el usuario "${user.username}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = user.id ?? 0;
          this.userService.changePassword(id, changePasswordRequestDto).subscribe({
            next: () => {
              this.getUsers();
              this.notify.success('!Contraseña actualizada!');
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
    this.notify.confirm('¿Estás seguro?', `¿Quieres descbloquear el usuario "${user.username}"?`)
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
}
