import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Presentation } from '../../../models/presentation';

declare var $: any;

@Component({
  selector: 'app-presentation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './presentation-form.html',
  styleUrl: './presentation-form.css'
})
export class PresentationFormComponent implements OnInit {

  @Input() presentation: Presentation | null = null;
  @Output() savePresentation = new EventEmitter<Presentation>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      abbreviation: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['presentation'] && changes['presentation'].currentValue) {
      const p = changes['presentation'].currentValue as Presentation;
      this.form.patchValue({
        id: p.id,
        name: p.name,
        abbreviation: p.abbreviation
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const presentation: Presentation = this.form.value;
    this.savePresentation.emit(presentation);
  }

  closePresentationForm(): void {
    $('#presentationModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      name: '',
      abbreviation: ''
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

}
