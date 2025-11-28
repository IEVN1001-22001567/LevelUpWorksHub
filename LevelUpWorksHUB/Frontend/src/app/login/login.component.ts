import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // ajusta la ruta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  isLoginMode: boolean = true;

  username: string = '';
  email: string = '';
  password: string = '';

  cargando = false;
  errorMsg = '';
  successMsg = '';

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
    this.errorMsg = '';
    this.successMsg = '';
    this.cargando = true;

    if (this.isLoginMode) {
      // LOGIN
      this.authService.login(this.email, this.password).subscribe({
        next: (res: any) => {
          this.cargando = false;

          if (res.exito && res.usuario) {
            this.successMsg = 'Login exitoso';
            // el AuthService ya guardó user y emitió user$
            this.router.navigate(['/inicio']);
          } else {
            this.errorMsg = res.mensaje || 'Error al iniciar sesión';
          }
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.mensaje || 'Error en el servidor';
        }
      });

    } else {
      // REGISTER
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (res: any) => {
          this.cargando = false;
          if (res.exito) {
            this.successMsg = 'Usuario registrado, ahora puedes iniciar sesión';
            this.isLoginMode = true;
          } else {
            this.errorMsg = res.mensaje || 'No se pudo registrar';
          }
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err.error?.mensaje || 'Error en el servidor';
        }
      });
    }
  }

  olvidoContrasena() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.email || !this.password) {
      this.errorMsg = 'Escribe tu correo y la nueva contraseña que quieres usar';
      return;
    }

    this.cargando = true;
    this.authService.forgotPassword(this.email, this.password).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.exito) {
          this.successMsg = res.mensaje;
          this.password = '';
        } else {
          this.errorMsg = res.mensaje || 'No se pudo actualizar la contraseña';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.mensaje || 'Error en el servidor';
      }
    });
  }
}
