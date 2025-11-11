import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeFormComponent } from '../forms/employee-form-component/employee-form-component';
import { BooleanToTextPipe } from '../../shared/pipes/boolean-to-text-pipe';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';
import { EmployeeRequestDto } from '../../models/employee-request-dto';
import { UserService } from '../../services/user.service';
import { HasRoleDirective } from '../../core/has-role.directive';

declare var $: any;

@Component({
  selector: 'app-employee-component',
  imports: [
    CommonModule,
    FormsModule,
    EmployeeFormComponent,
    BooleanToTextPipe,
    FilterByPipe,
    HasRoleDirective
  ],
  templateUrl: './employee-component.html', 
  styleUrl: './employee-component.css'
})
export class EmployeeComponent implements OnInit {

  @ViewChild('employeeFormModal') employeeFormModal!: EmployeeFormComponent;

  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  employeeForDetails: Employee | null = null;
  searchTerm: string = '';
  showActiveEmployees: boolean = true;

  constructor(
    private employeeService: EmployeeService, 
    private userService: UserService,
    private notify: NotificationService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  onToggleChange(): void {
    this.getEmployees();
  }

  openCreateModal(): void {
    this.selectedEmployee = null;
    this.employeeFormModal.resetFormAndModal();
    $('#employeeModal').modal('show');
  }

  openEditModal(employee: Employee) {
    this.selectedEmployee = employee;
    $('#employeeModal').modal('show');
  }

  closeEmployeeForm(): void {
    $('#employeeModal').modal('hide');
  }

  viewEmployeeDetails(employee: Employee): void {
    this.employeeForDetails = employee;
    $('#employeeDetailsModal').modal('show');
  }

  closeEmployeeDetails(): void {
    $('#employeeDetailsModal').modal('hide');
  }

  getEmployees(): void {
    this.employeeService.getEmployees(this.showActiveEmployees).subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (error) => {
        console.error('Error al obtener los empleados:', error);
      }
    });
  }

  onEmployeeSaved(employeeRequestDto: EmployeeRequestDto): void {
    if (employeeRequestDto.id) {
      this.employeeService.updateEmployee(employeeRequestDto.id, employeeRequestDto).subscribe({
        next: (res) => {
          this.getEmployees();
          this.notify.success('Empleado actualizado!', res?.message);
          this.closeEmployeeForm();
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      this.employeeService.createEmployee(employeeRequestDto).subscribe({
        next: (res) => {
          this.getEmployees();
          this.notify.success('¡Empleado agregado!', res?.message);
          this.closeEmployeeForm()
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  desactivateEmployee(employee: Employee): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres desactivar el empleado "${employee.firstName} ${employee.lastName}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = employee.id ?? 0;
          this.employeeService.desactivateEmployee(id).subscribe({
            next: () => {
              this.getEmployees();
              this.notify.success('¡Empleado descativado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  activateEmployee(employee: Employee): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres activar el empleado "${employee.firstName} ${employee.lastName}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = employee.id ?? 0;
          this.employeeService.activateEmployee(id).subscribe({
            next: () => {
              this.getEmployees();
              this.notify.success('¡Empleado activado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByEmployee(index: number, item: Employee): number {
    return item.id ?? index;
  }

}
