import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Compra {
  comprasID: number;
  usuarioid: number;
  juegoID: number;
  nombreproducto: string;
  descripción: string;
  precio: number;
  divisa: string;
  fechacompra: string;
  estado: string;
  username?: string;
  email?: string;
}

export interface ComprasResponse {
  exito: boolean;
  mensaje?: string;
  compras?: Compra[];
  estadisticas?: {
    total: number;
    completadas: number;
    pendientes: number;
    procesando: number;
    canceladas: number;
    ingresos_totales: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }


  obtenerTodasLasCompras(): Observable<ComprasResponse> {
    return this.http.get<ComprasResponse>(`${this.baseUrl}/admin/compras`);
  }


  obtenerComprasUsuario(usuarioid: number): Observable<ComprasResponse> {
    return this.http.get<ComprasResponse>(`${this.baseUrl}/admin/compras?usuarioid=${usuarioid}`);
  }


  actualizarEstadoCompra(comprasID: number, nuevoEstado: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/compras/${comprasID}`, {
      estado: nuevoEstado
    });
  }

  
  eliminarCompra(comprasID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/compras/${comprasID}`);
  }
}
