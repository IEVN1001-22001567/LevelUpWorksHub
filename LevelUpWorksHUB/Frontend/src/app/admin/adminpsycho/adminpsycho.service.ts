import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminPsychoService {

  private API_URL = 'http://127.0.0.1:5000/psycho';

  constructor(private http: HttpClient) {}

  // ARTÍCULOS
  getArticulos(): Observable<any> {
    return this.http.get(`${this.API_URL}/articulos`);
  }

  crearArticulo(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/articulos`, data);
  }

  editarArticulo(id_articulo: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/articulos/${id_articulo}`, data);
  }

  eliminarArticulo(id_articulo: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/articulos/${id_articulo}`);
  }

  // ESTADISTICAS
  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.API_URL}/estadisticas`);
  }

  guardarEstadistica(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/estadisticas`, data);
  }
}
