import { TestBed } from '@angular/core/testing';

import { ProyectoapiService } from './proyectoapi.service';

describe('ProyectoapiService', () => {
  let service: ProyectoapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProyectoapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
