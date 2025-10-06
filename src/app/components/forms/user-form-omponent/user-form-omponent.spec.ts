import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormOmponent } from './user-form-omponent';

describe('UserFormOmponent', () => {
  let component: UserFormOmponent;
  let fixture: ComponentFixture<UserFormOmponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormOmponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFormOmponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
