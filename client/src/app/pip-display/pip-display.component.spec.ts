import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipDisplayComponent } from './pip-display.component';

describe('PipDisplayComponent', () => {
  let component: PipDisplayComponent;
  let fixture: ComponentFixture<PipDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
