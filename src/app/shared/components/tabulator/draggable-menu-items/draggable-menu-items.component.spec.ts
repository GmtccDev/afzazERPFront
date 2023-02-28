import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableMenuItemsComponent } from './draggable-menu-items.component';

describe('DraggableMenuItemsComponent', () => {
  let component: DraggableMenuItemsComponent;
  let fixture: ComponentFixture<DraggableMenuItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraggableMenuItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraggableMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
