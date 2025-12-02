import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResenasService {
  private apiUrl = 'http://localhost:5000/api/resenas';
  private adminUrl = 'http://localhost:5000/api/admin/resenas';

  constructor(private http: HttpClient) { }

  obtenerResenasJuego(juegoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${juegoID}`);
  }

  obtenerRatingJuego(juegoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rating/${juegoID}`);
  }

  crearResena(resena: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, resena);
  }

  votarUtil(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${resenaID}/votar-util`, {});
  }

  obtenerResenasAdmin(estado?: string): Observable<any> {
    const params = estado ? `?estado=${estado}` : '';
    return this.http.get<any>(`${this.adminUrl}${params}`);
  }

obtenerResenasPorJuego(juegoID: number) {
  return this.http.get(`${this.adminUrl}/api/resenas/${juegoID}`);
}


  aprobarResena(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${resenaID}/aprobar`, {});
  }

  rechazarResena(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${resenaID}/rechazar`, {});
  }

  eliminarResena(resenaID: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${resenaID}/eliminar`);
  }
}
