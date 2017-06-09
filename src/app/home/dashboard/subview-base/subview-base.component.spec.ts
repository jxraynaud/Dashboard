import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubviewBaseComponent } from './subview-base.component';

describe('SubviewBaseComponent', () => {
  let component: SubviewBaseComponent;
  let fixture: ComponentFixture<SubviewBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubviewBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubviewBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
