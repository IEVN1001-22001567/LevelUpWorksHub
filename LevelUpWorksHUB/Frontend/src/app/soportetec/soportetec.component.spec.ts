import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoportetecComponent } from './soportetec.component';

describe('SoportetecComponent', () => {
  let component: SoportetecComponent;
  let fixture: ComponentFixture<SoportetecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoportetecComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoportetecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
