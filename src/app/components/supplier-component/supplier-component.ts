import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierFormComponent } from '../forms/supplier-form-component/supplier-form-component';
import { Supplier } from '../../models/supplier';
import { SupplierService } from '../../services/supplier.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-supplier-component',
  imports: [
    CommonModule,
    FormsModule,
    SupplierFormComponent
  ],
  templateUrl: './supplier-component.html',
  styleUrl: './supplier-component.css'
})
export class SupplierComponent {

  @ViewChild('supplierFormModal') supplierFormModal!: SupplierFormComponent;

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;
  supplierForDetails: Supplier | null = null;
  searchTerm: string = '';
  showActivateClients: boolean = true;

  constructor(private supplierService: SupplierService) {}

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
    this.closeSupplierDetails();
    $('#supplierModal').modal('show');
  }

  closeSupplierForm(): void {
    $('#supplierModal').modal('hide');
  }

  viewSupplierDetails(supplier: Supplier): void {
    this.supplierForDetails = supplier;
    $('#supplierDetailsModal').modal('show');
  }

  closeSupplierDetails(): void {
    $('#supplierDetailsModal').modal('hide');
  }

  getSuppliers(): void {
    this.supplierService.getSuppliers(this.showActivateClients).subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = [...this.suppliers];
        console.log('Proveedores obtenidos:', this.filteredSuppliers);
      },
      error: (error) => {
        console.error('Error al obtener los proveedores:', error);
      }
    });
  }

  filterSuppliers(): void {
    if (!this.searchTerm) {
      this.filteredSuppliers = [...this.suppliers];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(lowerCaseSearchItem)
      );
    }
  }

  onSupplierSaved(supplier: Supplier): void {
    if (supplier.id) {
      this.supplierService.updateSupplier(supplier.id, supplier).subscribe({
        next: () => {
          this.getSuppliers()
          Swal.fire({
            icon: 'success',
            title: 'Proveedor Actulizada',
            text: 'El proveedor fue actualizado con exito.',
            confirmButtonText: 'OK'
          });
          $('#supplierModal').modal('hide');
        }, 
        error(err) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: err.error.message
          });
          console.log(err);
        }
      });
    } else {
      console.log("Proveedor para crear:" + supplier)
      this.supplierService.createSupplier(supplier).subscribe({
        next: () => {
          this.getSuppliers();
          Swal.fire({
            icon: 'success',
            title: 'Proveedor Guardado!',
            text: 'El Proveedor fue guardado con exito.',
            confirmButtonText: 'OK'
          });
          $('#supplierModal').modal('hide');
        },
        error(err) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: err.error.message
          });
          console.error(err);
        }
      });
    }
  }

  deleteSupplier(supplier: Supplier): void {
    Swal.fire({
      title: 'Estás seguro?',
      text: `Quieres elimanr el proveedror "${supplier.name}" ?. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: ' Si, Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let id: number = supplier.id ?? 0;
        this.supplierService.deleteSupplier(id).subscribe({
          next: () => {
            this.getSuppliers();
            Swal.fire({
              icon: 'success',
              title: 'Proveedor Eliminado!',
              text: 'El proveedor fue eliminado con exito.',
              confirmButtonText: 'OK'
            });
          },
          error(err) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: err.error.message
            });
            console.error(err);
          }
        });
      }
    });
  }

}
