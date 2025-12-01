// src/app/navbar/navbar.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {

  user: Usuario | null = null;
  avatarInitial: string = '';
  menuAbierto = false;

  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.user$.subscribe(u => {
      this.user = u;
      this.calcularAvatarInitial();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  private calcularAvatarInitial() {
    if (this.user?.username && this.user.username.length > 0) {
      this.avatarInitial = this.user.username.charAt(0).toUpperCase();
    } else if (this.user?.email && this.user.email.length > 0) {
      this.avatarInitial = this.user.email.charAt(0).toUpperCase();
    } else {
      this.avatarInitial = '';
    }
  }

  get esAdmin(): boolean {
    return this.user?.rol === 'admin';
  }

  toggleMenuUsuario() {
    this.menuAbierto = !this.menuAbierto;
  }

  irAPerfil() {
    this.menuAbierto = false;
    this.router.navigate(['/personalizarperfil']);
  }

  logout() {
    this.authService.limpiarUsuario();
    this.menuAbierto = false;
    this.router.navigate(['/inicio']);
  }
}
