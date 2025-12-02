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

  // Obtener reseñas publicadas de un juego
  obtenerResenasJuego(juegoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${juegoID}`);
  }

  // Obtener rating promedio de un juego
  obtenerRatingJuego(juegoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rating/${juegoID}`);
  }

  // Crear nueva reseña
  crearResena(resena: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, resena);
  }

  // Votar como útil una reseña
  votarUtil(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${resenaID}/votar-util`, {});
  }

  // Admin: Obtener todas las reseñas
  obtenerResenasAdmin(estado?: string): Observable<any> {
    const params = estado ? `?estado=${estado}` : '';
    return this.http.get<any>(`${this.adminUrl}${params}`);
  }

  // Admin: Aprobar reseña
  aprobarResena(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${resenaID}/aprobar`, {});
  }

  // Admin: Rechazar reseña
  rechazarResena(resenaID: number): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${resenaID}/rechazar`, {});
  }

  // Admin: Eliminar reseña
  eliminarResena(resenaID: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${resenaID}/eliminar`);
  }
}
