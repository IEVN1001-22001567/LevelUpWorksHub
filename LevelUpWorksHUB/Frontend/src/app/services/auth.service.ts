// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Usuario {
  usuarioid: number;
  username: string;
  email: string;
  rol: string;
  saldo?: number;
  avatar?: string;
  nombre?: string;
  telefono?: string;
  biografia?: string;
  registrofecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // OJO: sin /api aquí
  private baseUrl = 'http://127.0.0.1:5000';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuario());
  user$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http.post<any>(`${this.baseUrl}/login`, body).pipe(
      tap(res => {
        if (res.exito && res.usuario) {
          this.guardarUsuario(res.usuario);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post<any>(`${this.baseUrl}/register`, body).pipe(
      tap(res => {
        if (res.exito && res.usuario) {
          this.guardarUsuario(res.usuario);
        }
      })
    );
  }

  forgotPassword(email: string, newPassword: string): Observable<any> {
    const body = { email, new_password: newPassword };
    return this.http.post<any>(`${this.baseUrl}/forgot_password`, body);
  }

  guardarUsuario(usuario: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  obtenerUsuario(): Usuario | null {
    const data = localStorage.getItem('usuario');
    if (!data) return null;
    try {
      return JSON.parse(data) as Usuario;
    } catch {
      return null;
    }
  }

  limpiarUsuario() {
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }
}
