import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsicowellnesComponent } from './psychowellness.component';

describe('PsicowellnesComponent', () => {
  let component: PsicowellnesComponent;
  let fixture: ComponentFixture<PsicowellnesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsicowellnesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsicowellnesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
