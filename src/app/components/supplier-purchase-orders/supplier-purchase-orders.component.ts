import { Component, OnInit } from '@angular/core';
import { PurchaseOrder, PurchaseOrderItemRequest, PurchaseOrderRequest } from '../../models/purchase-order.models';
import { Product } from '../../models/product';
import { PurchaseOrderStatus } from '../../models/purchase-order-status.enum';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService } from '../../services/supplier.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-supplier-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent
  ],
  templateUrl: './supplier-purchase-orders.component.html',
  styleUrl: './supplier-purchase-orders.component.css'
})
export class SupplierPurchaseOrdersComponent implements OnInit {

  readonly statusEnum = PurchaseOrderStatus;

  supplierId!: number;
  supplierName?: string;
  isSaving = false;
  errorMessage?: string;
  orderForm!: FormGroup;

  orders: PurchaseOrder[] = [];
  products: Product[] = [];

  draftItems: { product: Product; quantity: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private purchaseOrderService: PurchaseOrderService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.supplierId = Number(this.route.snapshot.paramMap.get('supplierId'));
    this.initForm();
    this.loadOrders();
    this.loadProductsForSupplier();
  }

  loadOrders(): void {
    this.purchaseOrderService.getBySupplier(this.supplierId).subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
      },
      error: (error) => {
        console.error('Error al obtener las ordenes de compra', error)
      } 
    });
  }

  loadProductsForSupplier(): void {
    this.supplierService.getProductsBySupplier(this.supplierId).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
      },
      error: (error) => {
        console.error('Error los productos', error)
      } 
    });
  }

  get expectedDeliveryDateControl() {
    return this.orderForm.get('expectedDeliveryDate');
  }

  get productIdControl() {
    return this.orderForm.get('productId');
  }

  get quantityControl() {
    return this.orderForm.get('quantity');
  }

  get draftTotalQuantity(): number {
    return this.draftItems.reduce((acc, i) => acc + i.quantity, 0);
  }

  get canCreateOrder(): boolean {
    return this.draftItems.length > 0;
  }

  get canAddItem(): boolean {
    return this.productIdControl?.valid === true && this.quantityControl?.valid === true;
  }

  addItem(): void {
    if (!this.canAddItem) {
      return;
    }

    const productId = this.productIdControl?.value;
    const quantity = this.quantityControl?.value as number;

    const product = this.products.find(p => p.id === productId);

    if (!product || !quantity || quantity <= 0) {
      return;
    }

    const existing = this.draftItems.find(i => i.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.draftItems.push({ product, quantity });
    }

    this.orderForm.patchValue({
      productId: null,
      quantity: null
    });

    this.productIdControl?.markAsPristine();
    this.productIdControl?.markAsUntouched();
    this.quantityControl?.markAsPristine();
    this.quantityControl?.markAsUntouched();
  }

  removeDraftItem(productId: number): void {
    this.draftItems = this.draftItems.filter(i => i.product.id !== productId);
  }

  createOrder(): void {
    if (!this.canCreateOrder) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = undefined;

    const items: PurchaseOrderItemRequest[] = this.draftItems.map(i => ({
      productId: i.product.id!,
      quantityOrdered: i.quantity
    }));

    const expectedDate = this.expectedDeliveryDateControl?.value as string | null;

    const request: PurchaseOrderRequest = {
      supplierId: this.supplierId,
      expectedDeliveryDate: expectedDate ? new Date(expectedDate).toISOString() : undefined,
      items
    };

    this.purchaseOrderService.createOrder(request).subscribe({
      next: (res) => {
        const order = res.data;
        this.orders.unshift(order);
        this.draftItems = [];
        this.orderForm.patchValue({
          expectedDeliveryDate: null
        });
        this.isSaving = false;
      },
      error: (error) => {
        console.error(error);
        this.isSaving = false;
      }
    });
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      expectedDeliveryDate: [null],
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

}
