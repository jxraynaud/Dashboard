import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDataRequestComponent } from './form-data-request.component';

describe('FormDataRequestComponent', () => {
  let component: FormDataRequestComponent;
  let fixture: ComponentFixture<FormDataRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDataRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDataRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
