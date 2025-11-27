import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent {

  categorias = ['Todas', 'Actualización', 'Logro', 'Premios', 'Desarrollo', 'Anuncio'];

  NuevosArticulos = [
    {
      id: 1,
      title: 'Nueva Actualización de Wyvern Quest: El Reino Olvidado',
      date: '8 de Noviembre, 2025',
      author: 'Equipo Level Up Hub',
      category: 'Actualización',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      excerpt: 'Descubre la nueva expansión…',
      featured: true
    },
    {
      id: 2,
      title: 'Chainsaw of the Dead alcanza 1 millón de descargas',
      date: '5 de Noviembre, 2025',
      author: 'Ana Rodríguez',
      category: 'Logro',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
      excerpt: 'Celebramos este increíble hito…'
    },
    {
      id: 3,
      title: 'Burnout VR gana premio a Mejor Juego de Terror Inmersivo',
      date: '1 de Noviembre, 2025',
      author: 'Carlos Mendoza',
      category: 'Premios',
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac',
      excerpt: 'Burnout VR ha sido galardonado…'
    },
    {
      id: 4,
      title: 'Detrás de escenas: Cómo creamos los dragones de Wyvern Quest',
      date: '28 de Octubre, 2025',
      author: 'David Torres',
      category: 'Desarrollo',
      image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
      excerpt: 'Un vistazo técnico al proceso…'
    },
    {
      id: 5,
      title: 'Nuevo modo cooperativo para Chainsaw of the Dead',
      date: '25 de Octubre, 2025',
      author: 'Miguel Santos',
      category: 'Actualización',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
      excerpt: 'La supervivencia zombie ahora es más intensa…'
    },
    {
      id: 6,
      title: 'Roadmap 2026: Qué esperar de Level Up Hub',
      date: '20 de Octubre, 2025',
      author: 'Equipo Level Up Hub',
      category: 'Anuncio',
      image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa',
      excerpt: 'Revelamos nuestros planes para 2026…'
    }
  ];

  // 👉 Artículo destacado
  get articuloDestacado() {
    return this.NuevosArticulos.find(a => a.featured);
  }

  // 👉 Artículos NO destacados
  get articulosNormales() {
    return this.NuevosArticulos.filter(a => !a.featured);
  }

}
