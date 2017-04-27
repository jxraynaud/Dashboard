import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAttributionComponent } from './multi-attribution.component';

describe('MultiAttributionComponent', () => {
  let component: MultiAttributionComponent;
  let fixture: ComponentFixture<MultiAttributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiAttributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiAttributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
