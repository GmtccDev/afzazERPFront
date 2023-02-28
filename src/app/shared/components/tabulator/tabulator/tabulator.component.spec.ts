import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabulatorComponent } from './tabulator.component';

describe('TabulatorComponent', () => {
  let component: TabulatorComponent;
  let fixture: ComponentFixture<TabulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabulatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
