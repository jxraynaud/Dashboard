import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BykpiviewComponent } from './bykpiview.component';

describe('BykpiviewComponent', () => {
  let component: BykpiviewComponent;
  let fixture: ComponentFixture<BykpiviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BykpiviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BykpiviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
