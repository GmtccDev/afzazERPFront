import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDateComponent } from './full-date.component';

describe('FullDateComponent', () => {
  let component: FullDateComponent;
  let fixture: ComponentFixture<FullDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
