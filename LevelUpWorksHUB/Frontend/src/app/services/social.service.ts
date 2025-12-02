import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Amigo {
  id: number;
  nombre: string;
  username: string;
  avatar?: string;
  estado: 'online' | 'offline' | 'jugando';
  juego: string;
}

export interface Solicitud {
  amistad_id: number;
  usuarioid: number;
  username: string;
  nombre: string;
  avatar?: string;
  fecha_solicitud: string;
}

export interface Mensaje {
  mensaje_id: number;
  remitente_id: number;
  destinatario_id: number;
  contenido: string;
  fecha_envio: string;
  leido: boolean;
}

export interface UsuarioBusqueda {
  usuarioid: number;
  username: string;
  nombre: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) { }

  obtenerAmigos(usuarioid: number): Observable<{ exito: boolean; amigos: Amigo[] }> {
    return this.http.get<any>(`${this.baseUrl}/api/social/amigos/${usuarioid}`);
  }

  obtenerSolicitudes(usuarioid: number): Observable<{ exito: boolean; solicitudes: Solicitud[] }> {
    return this.http.get<any>(`${this.baseUrl}/api/social/solicitudes/${usuarioid}`);
  }

  buscarUsuarios(termino: string, usuarioid: number): Observable<{ exito: boolean; usuarios: UsuarioBusqueda[] }> {
    return this.http.get<any>(`${this.baseUrl}/api/social/buscar?q=${termino}&usuarioid=${usuarioid}`);
  }

  agregarAmigo(usuario_actual: number, usuario_destino: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/agregar-amigo`, {
      usuario_actual,
      usuario_destino
    });
  }

  aceptarAmistad(amistad_id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/aceptar-amistad/${amistad_id}`, {});
  }

  rechazarAmistad(amistad_id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/rechazar-amistad/${amistad_id}`, {});
  }

  eliminarAmigo(amigo_id: number, usuario_actual: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/eliminar-amigo/${amigo_id}`, {
      usuario_actual
    });
  }

  obtenerMensajes(usuario1: number, usuario2: number): Observable<{ exito: boolean; mensajes: Mensaje[] }> {
    return this.http.get<any>(`${this.baseUrl}/api/social/mensajes/${usuario1}/${usuario2}`);
  }

  enviarMensaje(remitente_id: number, destinatario_id: number, contenido: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/enviar-mensaje`, {
      remitente_id,
      destinatario_id,
      contenido
    });
  }

  actualizarEstado(usuarioid: number, estado: 'online' | 'offline' | 'jugando', juego_actual?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/social/estado`, {
      usuarioid,
      estado,
      juego_actual
    });
  }
}
