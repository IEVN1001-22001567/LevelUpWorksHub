import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSoporteComponent } from './adminsoporte.component';

describe('AdminsoporteComponent', () => {
  let component: AdminSoporteComponent;
  let fixture: ComponentFixture<AdminSoporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSoporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSoporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
