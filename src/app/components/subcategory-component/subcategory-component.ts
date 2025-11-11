import { Component, OnInit, ViewChild } from '@angular/core';
import { Subcategory } from '../../models/subcategory';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcategoryService } from '../../services/subcategory.service';
import { SubcategoryFormComponent } from '../forms/subcategory-form-component/subcategory-form';
import { SubcategoryRequestDto } from '../../models/subcategory-request-dto';
import { NotificationService } from '../../services/notification.service';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';

declare var $: any;

@Component({
  selector: 'app-subcategory',
  imports: [
    CommonModule,
    FormsModule,
    SubcategoryFormComponent,
    FilterByPipe
  ],
  templateUrl: './subcategory-component.html',
  styleUrl: 'subcategory-component.css'
})
export class SubcategoryComponent implements OnInit {

  @ViewChild('subcategoryFormModal') subcategoryFormModal!: SubcategoryFormComponent;

  subcategories: Subcategory[] = [];
  selectedSubcategory: Subcategory | null = null;
  subcategoryForDetails: Subcategory | null = null;
  searchTerm: string = '';

  constructor(private subcategoryService: SubcategoryService, private notify: NotificationService) {}

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
      },
      error: (error) => {
        console.error('Error al obtener las subcategorias:', error);
      }
    });
  }

  onSubcategorySaved(subcategoryRequestDto: SubcategoryRequestDto): void {
    if (subcategoryRequestDto.id) {
      this.subcategoryService.updateSubcategory(subcategoryRequestDto.id, subcategoryRequestDto).subscribe({
        next: (res) => {
          this.getSubcategories();
          this.notify.success('¡Categoría actualizada!', res?.message);
          $('#subcategoryModal').modal('hide');
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      this.subcategoryService.createSubcategory(subcategoryRequestDto).subscribe({
        next: (res) => {
          this.getSubcategories();
          this.notify.success('¡Categoría agregada!', res?.message);
          $('#subcategoryModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  deleteSubcategory(subcategory: Subcategory): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar la subcategoría "${subcategory.name}? Esta acción es irreversible."`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = subcategory.id ?? 0;
          this.subcategoryService.deleteSubcategory(id).subscribe({
            next: () => {
              this.getSubcategories();
              this.notify.success('¡Subcategoría eliminada!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackBySubcategory(index: number, item: Subcategory): number {
    return item.id ?? index;
  }

}
