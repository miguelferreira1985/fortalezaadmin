import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { BooleanToTextPipe } from '../../shared/pipes/booelean-to-text-pipe';
import { UserFormOmponent } from '../forms/user-form-omponent/user-form-omponent';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { RoleNamePipe } from '../../shared/pipes/role-name-pipe';

declare var $: any;

@Component({
  selector: 'app-user-component',
  imports: [
    CommonModule,
    FormsModule,
    FilterByPipe,
    BooleanToTextPipe,
    RoleNamePipe
  ],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css'
})
export class UserComponent implements OnInit {

  @ViewChild('userFormModal') userFormModal!: UserFormOmponent;

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

  openCreateModal(): void {
    this.selectedUser = null;
    $('#userModal').modal('show');
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    $('#userModal').modal('show');
  }

  closeCategoryForm(): void {
    $('#userModal').modal('hide');
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
}
