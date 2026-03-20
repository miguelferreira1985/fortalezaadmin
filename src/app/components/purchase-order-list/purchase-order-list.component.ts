import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Supplier } from '../../models/supplier';
import { PurchaseOrder, PurchaseOrderStatusUpdateRequestDTO } from '../../models/purchase-order.models';
import { PurchaseOrderStatus } from '../../models/purchase-order-status.enum';
import { SupplierService } from '../../services/supplier.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-purchase-order-list.component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.css'
})
export class PurchaseOrderListComponent implements OnInit {

  filterForm!: FormGroup;

  suppliers: Supplier[] = [];
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];

  isLoading = false;
  errorMessage?: string;

  readonly statusEnum = PurchaseOrderStatus;
  
  readonly statusOptions =  [
    { value: 'ALL', label: 'Todas' },
    { value: PurchaseOrderStatus.PENDIENTE, label: 'Pendiente' },
    { value: PurchaseOrderStatus.PARCIALMENTE_RECIBIDA, label: 'Parcialmente recibida'},
    { value: PurchaseOrderStatus.COMPLETADA, label: 'Completada'},
    { value: PurchaseOrderStatus.CANCELADA, label: 'Cancelada' }
  ];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private purchaseOrderService: PurchaseOrderService,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSuppliers();
  }

  private buildForm(): void {
    this.filterForm = this.fb.group({
      supplierId: [null, Validators.required],
      status: [{ value: 'ALL', disabled: true }]
    });

    this.filterForm.get('supplierId')!.valueChanges.subscribe(value => {
      const statusControl = this.filterForm.get('status')!;
      if (value) {
        statusControl.enable({ emitEvent: false });
      } else {
        statusControl.disable({ emitEvent: false });
      }
    });
  }

  private loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error) => {
        console.error('Error al obtener los proveedores', error);
      }
    });
  }

  get supplierIdControl() {
    return this.filterForm.get('supplierId');
  }

  get statusControl() {
    return this.filterForm.get('status');
  }

  get canSearch() {
    return this.filterForm.valid && !this.isLoading;
  }

  onSearch(): void {
    if(!this.filterForm.valid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const supplierId = this.supplierIdControl!.value as number;
    const statusValue = this.statusControl?.enabled ? this.statusControl!.value : 'ALL';

    this.purchaseOrderService.getBySupplier(supplierId).subscribe({
      next: res => {
        this.orders = res.data ?? [];
        this.filteredOrders = this.applyStatusFilter(this.orders, statusValue);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener las ordenes', error);
        this.isLoading = false;
      }
    });
  }

  private applyStatusFilter(orders: PurchaseOrder[], status: string ): PurchaseOrder[] {
    if (status === 'ALL') {
      return orders;
    }
    return orders.filter(o => o.status === status);
  }

  viewDetails(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', order.id]);
  }

  markAsCompleted(order: PurchaseOrder): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres marcar las orden #${order.id} como COMPLETADA?`)
      .then((result) => {
        if (result.isConfirmed) {
          const request: PurchaseOrderStatusUpdateRequestDTO = {
            newStatus: PurchaseOrderStatus.COMPLETADA
          };

          this.isLoading = true;
          this.purchaseOrderService.updateStatus(order.id, request).subscribe({
            next: res => {
              const updated = res.data;
              this.updateOrderInList(updated);
              this.isLoading = false;
              this.notify.success('Orden COMPLETADA con exito.')
            },
            error: (error) => {
              console.error('Error al completar la orden.', error);
              this.isLoading = false;
            }
          });
        }
      });
  }

  cancelOrder(order: PurchaseOrder): void {
    if (order.status !== PurchaseOrderStatus.PENDIENTE) {
      return;
    }

    if (!confirm(`¿Marcar la orden #${order.id} como COMPLETADA?`)) {
      return;
    }

    const request: PurchaseOrderStatusUpdateRequestDTO = {
      newStatus: PurchaseOrderStatus.CANCELADA
    };

    this.isLoading = true;
    this.purchaseOrderService.updateStatus(order.id, request).subscribe({
      next: res => {
        const updated = res.data;
        this.updateOrderInList(updated);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener las ordenes', error);
        this.isLoading = false;
      }
    });
  }

  private updateOrderInList(updated: PurchaseOrder): void {
    const idx = this.orders.findIndex(o => o.id === updated.id);
    if (idx >= 0) {
      this.orders[idx] = updated;
    }
    const filterStatus = this.statusControl!.enabled ? this.statusControl!.value : 'ALL';
    this.filteredOrders = this.applyStatusFilter(this.orders, filterStatus);
  }

}
