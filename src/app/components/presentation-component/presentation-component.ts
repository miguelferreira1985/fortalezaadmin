import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresentationFormComponent } from '../forms/presentation-form-component/presentation-form';
import { Presentation } from '../../models/presentation';
import { PresentationService } from '../../services/presentation.service';
import { NotificationService } from '../../services/notification.service';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';

declare var $: any;

@Component({
  selector: 'app-presentation',
  imports: [
    CommonModule,
    FormsModule,
    PresentationFormComponent,
    FilterByPipe
  ],
  templateUrl: './presentation-component.html',
  styleUrl: './presentation-component.css'
})
export class PresentationComponent {

  @ViewChild('presentationFormModal') presentationFormModal!: PresentationFormComponent;


  presentations: Presentation[] = [];
  selectedPresentation: Presentation | null = null;
  searchTerm: string = '';

  constructor(private presentationService: PresentationService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.getPresentations();
  }

  openCreateModal(): void {
    this.selectedPresentation = null;
    this.presentationFormModal.resetFormAndModal();
    $('#presentationModal').modal('show');
  }

  openEditModal(presentation: Presentation) {
    this.selectedPresentation = presentation;
    $('#presentationModal').modal('show');
  }

  closePresentationForm(): void {
    $('#presentationModal').modal('hide');
  }

  getPresentations(): void {
    this.presentationService.getAllPresentations().subscribe({
      next: (data) => {
        this.presentations = data;
      },
      error: (error) => {
        console.error('Error al obtener las presentaciones:', error);
      }
    });
  }

  onPresentationSaved(presentation: Presentation): void {
    if (presentation.id) {
      this.presentationService.updatePresentation(presentation.id, presentation).subscribe({
        next: (res) => {
          this.getPresentations();
          this.notify.success('¡Presentación actualizada!', res?.message);
          $('#presentationModal').modal('hide');
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      this.presentationService.createPresentation(presentation).subscribe({
        next: (res) => {
          this.getPresentations();
          this.notify.success('¡Presentación agregada!', res?.message);
          $('#presentationModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  deletePresentation(presentation: Presentation): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres eliminar la presentación "${presentation.name}? Esta acción es irreversible."`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = presentation.id ?? 0;
          this.presentationService.deletePresentation(id).subscribe({
            next: () => {
              this.getPresentations();
              this.notify.success('¡Presentación eliminada!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByPresentation(index: number, item: Presentation): number {
    return item.id ?? index;
  }

}
