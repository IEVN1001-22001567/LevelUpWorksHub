import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.component.html',
  styles: []
})
export class ResenasComponent {


  gameStats = [
    { name: 'Chainsaw of the Dead', rating: 4.5, count: 2 },
    { name: 'Wyvern Quest', rating: 4.5, count: 4 },
    { name: 'Burnout VR', rating: 4.7, count: 3 }
  ];


  filters = {
    game: 'Todos los juegos',
    rating: 'Todos los ratings',
    sort: 'Más recientes'
  };


  reviews = [
    {
      id: 1,
      title: 'El mundo de fantasía más detallado',
      verified: true,
      date: '20 nov 2025',
      rating: 5,
      game: 'Wyvern Quest',
      content: 'La atención al detalle en este juego es asombrosa. Cada aldea tiene su propia cultura, las misiones secundarias son tan buenas como la principal, y el lore es profundísimo. Un verdadero RPG de nueva generación.',
      user: 'DragonSlayer01',
      votes: 0
    },
    {
      id: 2,
      title: 'Aprovecha al máximo la VR',
      verified: true,
      date: '18 nov 2025',
      rating: 5,
      game: 'Burnout VR',
      content: 'Los controles en VR son intuitivos y la experiencia es increíblemente inmersiva. Cada objeto es interactivo y la sensación de presencia es incomparable. El mejor juego de terror VR del momento.',
      user: 'VREnthusiast',
      votes: 167
    },
    {
      id: 3,
      title: 'Demasiado aterrador para mí',
      verified: true,
      date: '15 nov 2025',
      rating: 4,
      game: 'Burnout VR',
      content: 'Es un juego increíble técnicamente, pero es tan aterrador que no puedo jugar más de 20 minutos seguidos. Los desarrolladores lograron su objetivo de asustar. ¡Tal vez demasiado bien!',
      user: 'ScaredEasily',
      votes: 92
    },
    {
      id: 4,
      title: '¡Terror en su máxima expresión!',
      verified: true,
      date: '12 nov 2025',
      rating: 5,
      game: 'Burnout VR',
      content: 'Si buscas la experiencia de terror más intensa en VR, este es tu juego. Me ha hecho gritar en voz alta más de una vez. La inmersión es total y los sustos están perfectamente diseñados.',
      user: 'HorrorFanatic',
      votes: 0
    },
    {
      id: 5,
      title: 'El mejor juego de zombies que he jugado',
      verified: true,
      date: '15 oct 2025',
      rating: 5,
      game: 'Chainsaw of the Dead',
      content: 'Increíble experiencia. Los gráficos son impresionantes, la jugabilidad es adictiva y la historia te mantiene al borde del asiento. Las mecánicas de supervivencia son brutales pero justas. 100% recomendado.',
      user: 'ZombieHunter99',
      votes: 156
    }
  ];


  escribirResena() {
    alert('Abrir modal para escribir reseña...');
  }

  votarUtil(id: number) {
    const review = this.reviews.find(r => r.id === id);
    if (review) review.votes++;
  }
}
