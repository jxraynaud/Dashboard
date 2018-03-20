import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostManagerComponent } from './cost-manager.component';

describe('CostManagerComponent', () => {
  let component: CostManagerComponent;
  let fixture: ComponentFixture<CostManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
