// src/app/biblioteca/biblioteca.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BibliotecaService, JuegoBiblioteca } from '../services/biblioteca.service';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css']
})
export class BibliotecaComponent implements OnInit {

  usuario: Usuario | null = null;

  searchTerm: string = '';
  juegos: JuegoBiblioteca[] = [];

  cargando = false;
  errorMsg = '';

  constructor(
    private bibliotecaSvc: BibliotecaService,
    private authSvc: AuthService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authSvc.obtenerUsuario();

    if (!this.usuario) {
      console.warn('No hay usuario logueado, no se puede cargar biblioteca');
      this.errorMsg = 'Debes iniciar sesión para ver tu biblioteca.';
      return;
    }

    const usuarioid = this.usuario.usuarioid;
    this.cargarBiblioteca(usuarioid);
  }

  private cargarBiblioteca(usuarioid: number): void {
    this.cargando = true;
    this.errorMsg = '';

    this.bibliotecaSvc.obtenerBiblioteca(usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.juegos = res.juegos;
          console.log('Juegos en biblioteca:', this.juegos);
        } else {
          this.errorMsg = 'No se pudo cargar la biblioteca.';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error HTTP al cargar biblioteca:', err);
        this.errorMsg = 'Error en el servidor al cargar la biblioteca.';
        this.cargando = false;
      }
    });
  }

  // Filtro simple por nombre
  juegosFiltrados(): JuegoBiblioteca[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.juegos;
    return this.juegos.filter(j =>
      j.nombre.toLowerCase().includes(term)
    );
  }

  // Solo para que no truene el HTML si tienes botones "Descargar/Jugar"
  descargar(juego: JuegoBiblioteca) {
    console.log('Descargar juego:', juego);
    alert('Descarga simulada de: ' + juego.nombre);
  }

  jugar(juego: JuegoBiblioteca) {
    console.log('Jugar juego:', juego);
    alert('Simulando inicio de: ' + juego.nombre);
  }
}
