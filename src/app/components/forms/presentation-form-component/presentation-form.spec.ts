import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationForm } from './presentation-form';

describe('PresentationForm', () => {
  let component: PresentationForm;
  let fixture: ComponentFixture<PresentationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
