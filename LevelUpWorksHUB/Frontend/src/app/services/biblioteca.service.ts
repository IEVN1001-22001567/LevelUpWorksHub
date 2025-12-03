// src/app/services/biblioteca.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JuegoBiblioteca {
  comprasID?: number;
  juegoID?: number;
  titulo?: string;
  portada?: string;
  descripcion?: string;
  precio?: number;
  divisa?: string;

  fecha_compra?: string;
  fechacompra?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BibliotecaService {
  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  obtenerBiblioteca(usuarioid: number): Observable<{ exito: boolean; juegos: JuegoBiblioteca[] }> {
    return this.http.get<{ exito: boolean; juegos: JuegoBiblioteca[] }>(
      `${this.baseUrl}/api/mis-juegos?usuarioid=${usuarioid}`
    );
  }
}
