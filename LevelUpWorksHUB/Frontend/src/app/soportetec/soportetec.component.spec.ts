import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteTecComponent } from './soportetec.component';

describe('SoporteTecComponent', () => {
  let component: SoporteTecComponent;
  let fixture: ComponentFixture<SoporteTecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteTecComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteTecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
