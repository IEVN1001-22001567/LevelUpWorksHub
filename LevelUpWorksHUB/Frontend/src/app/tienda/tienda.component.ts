import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css'
})
export class TiendaComponent {

  // Datos exactos de tu imagen
  juegos = [
    {
      id: 1,
      titulo: 'Chainsaw of the Dead',
      descripcion: 'Sobrevive al apocalipsis zombie con tu motosierra. RPG de acción con combate brutal, sistema de progresión profundo y crafting avanzado.',
      precio: 49.99,
      imagen: 'assets/img/chainsaw of the dead.jpg', // Foto de Zombies/Terror
      categoria: 'RPG de Supervivencia',
      rating: 4.8,
      reviews: '2,450',
      tags: ['Modo Historia', 'Cooperativo 4 jugadores', 'Sistema de crafting', '30+ horas de juego']
    },
    {
      id: 2,
      titulo: 'Wyvern Quest',
      descripcion: 'Embárcate en una épica aventura de fantasía. RPG de mundo abierto con dragones majestuosos, magia poderosa y misiones legendarias.',
      precio: 54.99,
      imagen: 'assets/img/Wyvern Quest.png',
      categoria: 'RPG de Mundo Abierto',
      rating: 4.9,
      reviews: '3,120',
      tags: ['Mundo Abierto 150km²', 'Sistema de magia', 'Combate con dragones', '50+ horas de juego']
    },
    {
      id: 3,
      titulo: 'Burnout',
      descripcion: 'Terror en primera persona diseñado exclusivamente para realidad virtual. Experimenta el horror más inmersivo con tu visor VR.',
      precio: 39.99,
      imagen: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', // Foto de Gaming/VR
      categoria: 'Terror VR',
      rating: 4.7,
      reviews: '1,890',
      tags: ['Exclusivo VR', 'Terror psicológico', 'Audio 3D inmersivo', '8+ horas de terror']
    }
  ];

  faqs = [
    { pregunta: '¿Los juegos son compatibles con todas las plataformas?', respuesta: 'Todos nuestros juegos están desarrollados en Unity y son compatibles con PC Windows. Burnout requiere un visor VR compatible.' },
    { pregunta: '¿Hay reembolsos disponibles?', respuesta: 'Sí, ofrecemos reembolso completo dentro de las primeras 48 horas de compra si no has jugado más de 2 horas.' },
    { pregunta: '¿Los juegos reciben actualizaciones?', respuesta: 'Absolutamente. Actualizamos constantemente nuestros juegos con nuevo contenido.' }
  ];
}
