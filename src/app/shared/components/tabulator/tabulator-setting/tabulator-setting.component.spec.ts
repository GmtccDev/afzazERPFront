import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabulatorSettingComponent } from './tabulator-setting.component';

describe('TabulatorSettingComponent', () => {
  let component: TabulatorSettingComponent;
  let fixture: ComponentFixture<TabulatorSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabulatorSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabulatorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
