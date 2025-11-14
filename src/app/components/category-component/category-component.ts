import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../forms/category-form-component/category-form';
import { NotificationService } from '../../services/notification.service';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { HasRoleDirective } from '../../core/has-role.directive';
import { OrderByPipe } from '../../shared/pipes/order-by-pipe';

declare var $: any;

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    FormsModule, 
    CategoryFormComponent,
    FilterByPipe,
    HasRoleDirective,
    OrderByPipe
  ],
  templateUrl: './category-component.html',
  styleUrl: './category-component.css'
})
export class CategoryComponent {

  @ViewChild('categoryFormModal') categoryFormModal!: CategoryFormComponent;

  categories: Category[] = [];
  selectedCategory: Category | null = null;
  searchTerm: string = '';
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc'; 


  constructor(private categoryService: CategoryService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.getCategories();
  }

  openCreateModal(): void {
    this.selectedCategory = null;
    this.categoryFormModal.resetFormAndModal();
    $('#categoryModal').modal('show');
  }

  openEditModal(category: Category) {
    this.selectedCategory = category;
    $('#categoryModal').modal('show');
  }

  closeCategoryForm(): void {
    $('#categoryModal').modal('hide');
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

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error al obtener las categorias:', error);
      }
    });
  }

  onCategorySaved(category: Category): void {
    if (category.id) {
      this.categoryService.updateCategory(category.id, category).subscribe({
        next: (res) => {
          this.getCategories()
          this.notify.success('¡Categoría actualizada!', res?.message);
          $('#categoryModal').modal('hide');
        }, 
        error(err) {
          console.error(err);
        }
      });
    } else {
      this.categoryService.createCategory(category).subscribe({
        next: (res) => {
          this.getCategories();
          this.notify.success('¡Categoría agregada!', res?.message);
          $('#categoryModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar la categoría "${category.name}"? Esta acción es irreversible.`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = category.id ?? 0;
          this.categoryService.deleteCategory(id).subscribe({
            next: () => {
              this.getCategories();
              this.notify.success('¡Categoría eliminada!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByCategory(index: number, item: Category): number {
    return item.id ?? index;
  }

}
