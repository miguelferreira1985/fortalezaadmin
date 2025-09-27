import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresentationFormComponent } from '../forms/presentation-form-component/presentation-form';
import { Presentation } from '../../models/presentation';
import { PresentationService } from '../../services/presentation.service';
import { NotificationService } from '../../services/notification.service';

declare var $: any;

@Component({
  selector: 'app-presentation',
  imports: [
    CommonModule,
    FormsModule,
    PresentationFormComponent
  ],
  templateUrl: './presentation-component.html',
  styleUrl: './presentation-component.css'
})
export class PresentationComponent {

  @ViewChild('presentationFormModal') presentationFormModal!: PresentationFormComponent;


  presentations: Presentation[] = [];
  filteredPresentations: Presentation[] = [];
  selectedPresentation: Presentation | null = null;
  presentationForDetails: Presentation | null = null;
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
    this.closePresentationDetails();
    $('#presentationModal').modal('show');
  }

  closePresentationForm(): void {
    $('#presentationModal').modal('hide');
  }

  viewPresentationDetails(presentation: Presentation): void {
    this.presentationForDetails = presentation;
    $('#presentationDetailsModal').modal('show');
  }

  closePresentationDetails(): void {
    $('#presentationDetailsModal').modal('hide');
  }

  getPresentations(): void {
    this.presentationService.getAllPresentations().subscribe({
      next: (data) => {
        this.presentations = data;
        this.filteredPresentations = [...this.presentations];
      },
      error: (error) => {
        console.error('Error al obtener las presentaciones:', error);
      }
    });
  }

  filterPresentations(): void {
    if (!this.searchTerm) {
      this.filteredPresentations = [...this.presentations];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredPresentations = this.presentations.filter(presentation => 
        presentation.name.toLowerCase().includes(lowerCaseSearchItem) 
      );
    }
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

}
