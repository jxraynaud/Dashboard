import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatavizDatatableComponent } from './dataviz-datatable.component';

describe('DatavizDatatableComponent', () => {
  let component: DatavizDatatableComponent;
  let fixture: ComponentFixture<DatavizDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatavizDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatavizDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
