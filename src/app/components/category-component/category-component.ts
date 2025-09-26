import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import Swal from 'sweetalert2';
import { CategoryFormComponent } from '../forms/category-form-component/category-form';

declare var $: any;

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    FormsModule, 
    CategoryFormComponent
  ],
  templateUrl: './category-component.html',
  styleUrl: './category-component.css'
})
export class CategoryComponent {

  @ViewChild('categoryFormModal') categoryFormModal!: CategoryFormComponent;

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  selectedCategory: Category | null = null;
  categoryForDetails: Category | null = null;
  searchTerm: string = '';

  constructor(private categoryService: CategoryService) {}

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
    this.closeCategoryDetails();
    $('#categoryModal').modal('show');
  }

  closeCategoryForm(): void {
    $('#categoryModal').modal('hide');
  }

  viewCategoryDetails(category: Category): void {
    this.categoryForDetails = category;
    $('#categoryDetailsModal').modal('show');
  }

  closeCategoryDetails(): void {
    $('#categoryDetailsModal').modal('hide');
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = [...this.categories];
        console.log('Categorias obtenidas:', this.filteredCategories);
      },
      error: (error) => {
        console.error('Error al obtener las categorias:', error);
      }
    });
  }

  filterCategories(): void {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredCategories = this.categories.filter(category => 
        category.name.toLowerCase().includes(lowerCaseSearchItem) 
      );
    }
  }

  onCategorySaved(category: Category): void {
    if (category.id) {
      this.categoryService.updateCategory(category.id, category).subscribe({
        next: (res) => {
          this.getCategories()
          Swal.fire({
            icon: 'success',
            title: '¡Categoría Actualizada!',
            text: res.message,
            confirmButtonText: 'OK'
          });
          $('#categoryModal').modal('hide');
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
      this.categoryService.createCategory(category).subscribe({
        next: (res) => {
          this.getCategories();
          Swal.fire({
            icon: 'success',
            title: '¡Categoría Guardada!',
            text: res.message,
            confirmButtonText: 'OK'
          });
          $('#categoryModal').modal('hide');
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

}
