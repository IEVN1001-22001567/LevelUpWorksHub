import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adminnoticias.component.html',
  styles: []
})
export class AdminNoticiasComponent {

  // Simulamos datos de noticias
  noticias = [
    {
      id: 1,
      titulo: 'Nueva Actualización de Wyvern Quest: El Reino Olvidado',
      tipo: 'Actualización',
      fecha: '2025-11-08',
      autor: 'Equipo Level Up Hub',
      descripcion: 'Descubre la nueva expansión que añade 20+ horas de contenido.',
      imagen: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300' // Placeholder
    },
    {
      id: 2,
      titulo: 'Chainsaw of the Dead alcanza 1 millón de descargas',
      tipo: 'Logro',
      fecha: '2025-11-05',
      autor: 'Ana Rodríguez',
      descripcion: 'Celebramos este increíble hito con nuestra comunidad.',
      imagen: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=300' // Placeholder
    }
  ];

  // Función para ELIMINAR una noticia de la lista
  eliminarNoticia(id: number) {
    if(confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
      this.noticias = this.noticias.filter(n => n.id !== id);
    }
  }

  // Función simulada para EDITAR (Aquí conectarías tu formulario más adelante)
  editarNoticia(noticia: any) {
    alert(`Editando: ${noticia.titulo}\n(Aquí se abriría el formulario de edición)`);
  }

  // Función simulada para AGREGAR
  nuevaNoticia() {
    alert('Aquí se abriría el formulario para crear una nueva noticia.');
  }
}
