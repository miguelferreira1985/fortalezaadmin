import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Presentation } from '../../../models/presentation';

declare var $: any;

@Component({
  selector: 'app-presentation-form',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './presentation-form.html',
  styleUrl: './presentation-form.css'
})
export class PresentationFormComponent implements OnInit {

  @Input() presentation: Presentation | null = null;
  @Output() savePresentation = new EventEmitter<Presentation>();
  @ViewChild('presentationForm') presentationForm!: NgForm;

  formPresentation: Presentation = { name: '', abbreviation: '' };

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['presentation'] && changes['presentation'].currentValue) {
      // El valor del input `presentation` ha cambiado, es el momento de cargar los datos
      this.formPresentation = { ...changes['presentation'].currentValue };
      console.log('Presentation data loaded:', this.formPresentation);
    } else if (changes['presentation'] && !changes['presentation'].currentValue) {
      // El valor del input `product` es null, reseteamos el formulario
      console.log('Form reset for new presentation.');
    }
  }

  onSubmit(): void {
    this.savePresentation.emit(this.formPresentation);
  }

  closePresentationForm(): void {
    $('#presentationModal').modal('hide');
  }

  public resetFormAndModal(): void {
    this.formPresentation = { name: '', abbreviation: '' };

    setTimeout(() => {
      if (this.presentationForm) {
        this.presentationForm.resetForm(this.formPresentation);
        console.log('Formulario Reseteado');
      }
    });
  }

}
