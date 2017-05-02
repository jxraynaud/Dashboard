import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDataFiltersComponent } from './form-data-filters.component';

describe('FormDataFiltersComponent', () => {
  let component: FormDataFiltersComponent;
  let fixture: ComponentFixture<FormDataFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDataFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDataFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
