import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {

  constructor(private router: Router) {}

  isAdmin = true; // CAMBIA ESTO LUEGO A TU AUTH REAL

  hubGamerItems = [
    { name: 'Biblioteca de juegos', page: 'biblioteca' },
    { name: 'Centro de actualizaciones', page: 'actualizaciones' },
    { name: 'Noticias', page: 'noticias' },
    { name: 'Eventos y promociones', page: 'eventos' },
    { name: 'PsicoWellness', page: 'psicowellness' },
    { name: 'Mensajería', page: 'mensajeria' },
    { name: 'Licencias y Credenciales', page: 'licencias' },
  ];

  adminItems = [
    { name: 'Panel de Admin', page: 'admin-dashboard' },
    { name: 'Gestión de Tienda', page: 'admin-store' },
    { name: 'Gestión de Noticias', page: 'admin-news' },
    { name: 'Gestión de Usuarios', page: 'admin-users' },
    { name: 'Gestión PsicoWellness', page: 'admin-psicowellness' },
    { name: 'Gestión Mensajería', page: 'admin-messaging' },
    { name: 'Gestión de Licencias', page: 'admin-licenses' },
  ];

  navigate(page: string) {
    this.router.navigate([page]);
  }
}
