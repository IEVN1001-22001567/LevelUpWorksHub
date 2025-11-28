import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionComprasComponent } from './gestion-compras.component';

describe('TiendaComponent', () => {
  let component: GestionComprasComponent;
  let fixture: ComponentFixture<GestionComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
