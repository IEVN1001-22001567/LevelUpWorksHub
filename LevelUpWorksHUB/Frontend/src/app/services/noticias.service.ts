// src/app/services/noticias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Noticia {
  noticiaid?: number;
  titulo: string;
  tipo: string;
  fecha: string;
  autor: string;
  descripcion: string;
  imagen: string; // URL o base64
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {

  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  obtenerNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${this.baseUrl}/noticias`);
  }

  crearNoticia(noticia: Noticia): Observable<any> {
    return this.http.post(`${this.baseUrl}/noticias`, noticia);
  }

  actualizarNoticia(noticiaid: number, noticia: Noticia): Observable<any> {
    return this.http.put(`${this.baseUrl}/noticias/${noticiaid}`, noticia);
  }

  eliminarNoticia(noticiaid: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/noticias/${noticiaid}`);
  }
}