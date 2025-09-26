import { Component, OnInit, ViewChild } from '@angular/core';
import { Subcategory } from '../../models/subcategory';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcategoryService } from '../../services/subcategory.service';
import Swal from 'sweetalert2';
import { SubcategoryFormComponent } from '../forms/subcategory-form-component/subcategory-form';
import { SubcategoryRequestDto } from '../../models/subcategory-request-dto';

declare var $: any;

@Component({
  selector: 'app-subcategory',
  imports: [
    CommonModule,
    FormsModule,
    SubcategoryFormComponent
  ],
  templateUrl: './subcategory-component.html',
  styleUrl: './subcategory-component.css'
})
export class SubcategoryComponent implements OnInit {

  @ViewChild('subcategoryFormModal') subcategoryFormModal!: SubcategoryFormComponent;

  subcategories: Subcategory[] = [];
  filteredSubcategories: Subcategory[] = [];
  selectedSubcategory: Subcategory | null = null;
  subcategoryForDetails: Subcategory | null = null;
  searchTerm: string = '';

  constructor(private subcategoryService: SubcategoryService) {}

  ngOnInit(): void {
    this.getSubcategories();
  }

  openCreateModal(): void {
    this.selectedSubcategory = null;
    this.subcategoryFormModal.resetFormAndModal();
    $('#subcategoryModal').modal('show');
  }

  openEditModal(subcategory: Subcategory) {
    this.selectedSubcategory = subcategory;
    this.closeSubcategoryDetails();
    $('#subcategoryModal').modal('show');
  }

  closeSubcategoryForm(): void {
    $('#subcategoryModal').modal('hide');
  }

  viewSubcategoryDetails(subcategory: Subcategory): void {
    this.subcategoryForDetails = subcategory;
    $('#subcategoryDetailsModal').modal('show');
  }

  closeSubcategoryDetails(): void {
    $('#subcategoryDetailsModal').modal('hide');
  }

  getSubcategories(): void {
    this.subcategoryService.getSubcategories().subscribe({
      next: (data) => {
        this.subcategories = data;
        this.filteredSubcategories = [...this.subcategories];
        console.log('Subcategorias obtenidas:', this.filteredSubcategories);
      },
      error: (error) => {
        console.error('Error al obtener las subcategorias:', error);
      }
    });
  }

  filterSubcategories(): void {
    if (!this.searchTerm) {
      this.filteredSubcategories = [...this.subcategories];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredSubcategories = this.subcategories.filter(subcategory => 
        subcategory.name.toLowerCase().includes(lowerCaseSearchItem) 
      );
    }
  }

  onSubcategorySaved(subcategoryRequestDto: SubcategoryRequestDto): void {
    if (subcategoryRequestDto.id) {
      this.subcategoryService.updateSubcategory(subcategoryRequestDto.id, subcategoryRequestDto).subscribe({
        next: (res) => {
          this.getSubcategories()
          Swal.fire({
            icon: 'success',
            title: '¡Subcategoría Actualizada!',
            text: res.message,
            confirmButtonText: 'OK'
          });
          $('#subcategoryModal').modal('hide');
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
      this.subcategoryService.createSubcategory(subcategoryRequestDto).subscribe({
        next: (res) => {
          this.getSubcategories();
          Swal.fire({
            icon: 'success',
            title: '¡Subcategoría Guardada!',
            text: res.message,
            confirmButtonText: 'OK'
          });
          $('#subcategoryModal').modal('hide');
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
