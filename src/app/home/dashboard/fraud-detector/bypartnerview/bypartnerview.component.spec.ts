import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BypartnerviewComponent } from './bypartnerview.component';

describe('BypartnerviewComponent', () => {
  let component: BypartnerviewComponent;
  let fixture: ComponentFixture<BypartnerviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BypartnerviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BypartnerviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
