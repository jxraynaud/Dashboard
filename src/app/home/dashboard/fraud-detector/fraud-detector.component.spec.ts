import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudDetectorComponent } from './fraud-detector.component';

describe('FraudDetectorComponent', () => {
  let component: FraudDetectorComponent;
  let fixture: ComponentFixture<FraudDetectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FraudDetectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FraudDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
