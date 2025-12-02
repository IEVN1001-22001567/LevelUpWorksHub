import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychowellnessComponent } from './psychowellness.component';

describe('PsicowellnesComponent', () => {
  let component: PsychowellnessComponent;
  let fixture: ComponentFixture<PsychowellnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsychowellnessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsychowellnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
