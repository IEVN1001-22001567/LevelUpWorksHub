import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPsychoComponent } from './adminpsycho.component';

describe('AdminPsychoComponent', () => {
  let component: AdminPsychoComponent;
  let fixture: ComponentFixture<AdminPsychoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPsychoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPsychoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
