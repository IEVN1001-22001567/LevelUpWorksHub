import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css']
})
export class BibliotecaComponent {

  searchTerm: string = '';

  juegos = [
    {
      nombre: 'Cyber Strike',
      categoria: 'Acción',
      portada: 'assets/img/juegos/cyberstrike_portada.jpg',
      banner: 'assets/img/juegos/cyberstrike_banner.jpg',
      descripcion: 'Shooter futurista con combate intenso y ambientación cyberpunk.'
    },
    {
      nombre: 'Forest Legends',
      categoria: 'Aventura',
      portada: 'assets/img/juegos/forest_portada.jpg',
      banner: 'assets/img/juegos/forest_banner.jpg',
      descripcion: 'Exploración en un bosque mágico lleno de secretos y criaturas místicas.'
    },
    {
      nombre: 'Racing X',
      categoria: 'Carreras',
      portada: 'assets/img/juegos/racing_portada.jpg',
      banner: 'assets/img/juegos/racing_banner.jpg',
      descripcion: 'Carreras a toda velocidad en circuitos futuristas llenos de obstáculos.'
    }
  ];

  juegoSeleccionado = this.juegos[0];

  // Filtro de búsqueda
  juegosFiltrados() {
    return this.juegos.filter(j =>
      j.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Selección
  seleccionarJuego(juego: any) {
    this.juegoSeleccionado = juego;
  }
}
