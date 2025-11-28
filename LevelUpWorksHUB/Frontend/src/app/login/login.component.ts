import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Variable para saber si estamos en modo Login o Registro
  isLoginMode: boolean = true;

  // Función para cambiar de pestaña
  toggleMode(mode: 'login' | 'register') {
    this.isLoginMode = (mode === 'login');
  }
}
