// src/app/services/auth.service.ts  (por ejemplo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000'; // tu Flask

  // Estado del usuario en tiempo real
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // al recargar, leer de localStorage
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    this.userSubject.next(user);
  }

  // LOGIN
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.exito && res.usuario) {
          localStorage.setItem('user', JSON.stringify(res.usuario));
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          this.userSubject.next(res.usuario);
        }
      })
    );
  }

  // REGISTER
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  // FORGOT PASSWORD
  forgotPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email, newPassword });
  }

  // Obtener usuario actual sincrónico
  getUserSync() {
    return this.userSubject.value;
  }

  // Setear usuario manualmente (por si lo necesitas después)
  setUser(user: any) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }
}
