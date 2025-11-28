import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Game {
  id: string;
  title: string;
  price: number;
  genre: string;
  description: string;
  features: string[];
  image: string;
  rating: number;
  reviews: number;
}

@Component({
  selector: 'app-admin-juegos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminjuegos.component.html',
})
export class AdminJuegosComponent {
  games: Game[] = [
    {
      id: '1',
      title: 'Chainsaw of the Dead',
      price: 49.99,
      genre: 'RPG de Supervivencia',
      description: 'Sobrevive al apocalipsis zombie con tu motosierra.',
      features: ['Modo Historia', 'Cooperativo 4 jugadores', 'Sistema de crafting'],
      image: 'https://images.unsplash.com/photo-1572524777839-7d5213dc06d0?auto=format&w=800',
      rating: 4.8,
      reviews: 2450
    },
    {
      id: '2',
      title: 'Wyvern Quest',
      price: 54.99,
      genre: 'RPG de Mundo Abierto',
      description: 'Embárcate en una épica aventura de fantasía.',
      features: ['Mundo Abierto', 'Sistema de magia', 'Combate con dragones'],
      image: 'https://images.unsplash.com/photo-1758506127212-a180b2392347?auto=format&w=800',
      rating: 4.9,
      reviews: 3120
    }
  ];

  isAdding = false;
  editingId: string | null = null;

  formData: Partial<Game> = {};

  // === AGREGAR ===
  startAdd() {
    this.isAdding = true;
    this.formData = {
      title: '',
      price: 0,
      genre: '',
      description: '',
      image: '',
      rating: 0,
      reviews: 0,
      features: []
    };
  }

  // === EDITAR ===
  startEdit(game: Game) {
    this.editingId = game.id;
    this.formData = { ...game };
  }

  // === ELIMINAR ===
  deleteGame(id: string) {
    if (confirm('¿Seguro que deseas eliminar este juego?')) {
      this.games = this.games.filter(g => g.id !== id);
    }
  }

  // === GUARDAR ===
  saveGame() {
    if (this.isAdding) {
      const newGame: Game = {
        ...(this.formData as Game),
        id: Date.now().toString()
      };
      this.games.push(newGame);
      this.isAdding = false;
    } else if (this.editingId) {
      this.games = this.games.map(g =>
        g.id === this.editingId ? { ...g, ...(this.formData as Game) } : g
      );
      this.editingId = null;
    }

    this.formData = {};
  }

  cancel() {
    this.isAdding = false;
    this.editingId = null;
    this.formData = {};
  }
}

