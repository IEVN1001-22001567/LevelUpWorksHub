import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = 'http://127.0.0.1:5000/even_actu';

  constructor(private http: HttpClient) {}

  obtenerEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearEvento(data: any): Observable<any> {
    const formData = this.convertirAFormData(data);
    return this.http.post<any>(this.apiUrl, formData);
  }

  actualizarEvento(id: number, data: any): Observable<any> {
    const formData = this.convertirAFormData(data);
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  private convertirAFormData(data: any): FormData {
    const fd = new FormData();

    for (const key in data) {
      if (key !== 'imagen') {
        fd.append(key, data[key]);
      }
    }

    // Si la imagen viene como archivo, se manda
    if (data.imagenFile) {
      fd.append('imagen', data.imagenFile);
    }

    return fd;
  }
}
