import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatavizMapComponent } from './dataviz-map.component';

describe('DatavizMapComponent', () => {
  let component: DatavizMapComponent;
  let fixture: ComponentFixture<DatavizMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatavizMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatavizMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
