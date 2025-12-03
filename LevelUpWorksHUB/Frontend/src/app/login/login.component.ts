// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  isLoginMode: boolean = true;

  username: string = '';
  email: string = '';
  password: string = '';
  newPassword: string = '';
  cargando: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(mode: 'login' | 'register') {
    this.isLoginMode = (mode === 'login');
    this.errorMsg = '';
    this.successMsg = '';
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Ingresa tu correo y contraseña';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.cargando = false;
        console.log('Respuesta login:', res);

        if (res.exito) {
          this.successMsg = 'Inicio de sesión exitoso';
          this.router.navigate(['/inicio']);
        } else {
          this.errorMsg = res.mensaje || 'Credenciales incorrectas';
        }
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error login:', err);
        this.errorMsg = err.error?.mensaje || 'Error en el servidor';
      }
    });
  }

  onRegister() {
    if (!this.username || !this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res: any) => {
        this.cargando = false;
        console.log('Respuesta register:', res);

        if (res.exito) {
          this.successMsg = 'Registro exitoso, sesión iniciada';
          this.router.navigate(['/inicio']);
        } else {
          this.errorMsg = res.mensaje || 'No se pudo registrar';
        }
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error registro:', err);
        this.errorMsg = err.error?.mensaje || 'Error en el servidor';
      }
    });
  }

  olvidoContrasena() {
    if (!this.email || !this.newPassword) {
      this.errorMsg = 'Ingresa tu correo y la nueva contraseña';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.forgotPassword(this.email, this.newPassword).subscribe({
      next: (res: any) => {
        this.cargando = false;
        console.log('Respuesta forgotPassword:', res);

        if (res.exito) {
          this.successMsg = 'Contraseña actualizada, ahora inicia sesión';
        } else {
          this.errorMsg = res.mensaje || 'No se pudo actualizar la contraseña';
        }
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error forgotPassword:', err);
        this.errorMsg = err.error?.mensaje || 'Error en el servidor';
      }
    });
  }
}
