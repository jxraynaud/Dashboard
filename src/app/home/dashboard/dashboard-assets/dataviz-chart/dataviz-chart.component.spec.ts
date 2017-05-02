import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatavizChartComponent } from './dataviz-chart.component';

describe('DatavizChartComponent', () => {
  let component: DatavizChartComponent;
  let fixture: ComponentFixture<DatavizChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatavizChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatavizChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
