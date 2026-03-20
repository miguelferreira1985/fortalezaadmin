import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierFormComponent } from '../forms/supplier-form-component/supplier-form-component';
import { Supplier } from '../../models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { NotificationService } from '../../services/notification.service';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { HasRoleDirective } from '../../core/has-role.directive';
import { OrderByPipe } from '../../shared/pipes/order-by-pipe';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-supplier-component',
  imports: [
    CommonModule,
    FormsModule,
    SupplierFormComponent,
    FilterByPipe,
    HasRoleDirective,
    OrderByPipe
  ],
  templateUrl: './supplier-component.html',
  styleUrl: './supplier-component.css'
})
export class SupplierComponent {

  @ViewChild('supplierFormModal') supplierFormModal!: SupplierFormComponent;

  suppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;
  searchTerm: string = '';
  showActivateClients: boolean = true;
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc'; 

  constructor(
    private supplierService: SupplierService, 
    private router: Router,
    private notify: NotificationService) {}

  ngOnInit(): void {
    this.getSuppliers();
  }

  onTooggleChange(): void {
    this.getSuppliers();
  }

  openCreateModal(): void {
    this.selectedSupplier = null;
    this.supplierFormModal.resetFormAndModal();
    $('#supplierModal').modal('show');
  }

  openEditModal(supplier: Supplier) {
    this.selectedSupplier = supplier;
    $('#supplierModal').modal('show');
  }

  closeSupplierForm(): void {
    $('#supplierModal').modal('hide');
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

  getSuppliers(): void {
    this.supplierService.getSuppliers(this.showActivateClients).subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error) => {
        console.error('Error al obtener los proveedores:', error);
      }
    });
  }

  onSupplierSaved(supplier: Supplier): void {
    if (supplier.id) {
      this.supplierService.updateSupplier(supplier.id, supplier).subscribe({
        next: (res) => {
          this.getSuppliers();
          this.notify.success('¡Proveedor actualizado!', res?.message);
          $('#supplierModal').modal('hide');
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      this.supplierService.createSupplier(supplier).subscribe({
        next: (res) => {
          this.getSuppliers();
          this.notify.success('¡Proveedor agregado!', res?.message);
          $('#supplierModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  deleteSupplier(supplier: Supplier): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar el proveedror "${supplier.name}"?.`)
    .then((result) => {
      if (result.isConfirmed) {
        let id: number = supplier.id ?? 0;
        this.supplierService.deleteSupplier(id).subscribe({
          next: (res) => {
            this.getSuppliers();
            this.notify.success('¡Proveedor eliminado!', res?.message);
          },
          error(err) {
            console.error(err);
          }
        });
      }
    });
  }

  trackBySupplier(index: number, item: Supplier): number {
    return item.id ?? index;
  }

  goToPurchaseOrders(supplierId: number): void {
    this.router.navigate(['/suppliers', supplierId, 'purchase-orders']);
  }

}
