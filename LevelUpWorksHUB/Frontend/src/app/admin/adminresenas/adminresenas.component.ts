import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminresenas.component.html',
  styles: []
})
export class AdminResenasComponent {


  activeFilter: 'todas' | 'publicadas' | 'pendientes' | 'rechazadas' = 'todas';
  searchTerm: string = '';


  selectedReview: any = null;
  isEditing: boolean = false;


  stats = {
    total: 10,
    publicadas: 9,
    pendientes: 1,
    ratingPromedio: 4.5
  };


  gameStats = [
    { name: 'Chainsaw of the Dead', rating: 4.5, count: 2 },
    { name: 'Wyvern Quest', rating: 4.5, count: 4 },
    { name: 'Burnout VR', rating: 4.7, count: 3 }
  ];


  reviews = [
    { id: 'rev-001', juego: 'Chainsaw of the Dead', usuario: 'ZombieHunter99', usuarioVerificado: true, rating: 5, titulo: 'El mejor juego de zombies que...', estado: 'Publicada', util: 156, reportes: 0, fecha: '15 oct 2025, 08:30' },
    { id: 'rev-002', juego: 'Chainsaw of the Dead', usuario: 'SurvivalMaster', usuarioVerificado: true, rating: 4, titulo: 'Gran juego pero con algunos b...', estado: 'Publicada', util: 89, reportes: 0, fecha: '20 oct 2025, 03:15' },
    { id: 'rev-003', juego: 'Wyvern Quest', usuario: 'DragonSlayer_Elite', usuarioVerificado: true, rating: 5, titulo: 'RPG de mundo abierto definitivo', estado: 'Publicada', util: 234, reportes: 0, fecha: '1 nov 2025, 10:45' },
    { id: 'rev-004', juego: 'Wyvern Quest', usuario: 'RPGFanatic2025', usuarioVerificado: true, rating: 5, titulo: 'Cientos de horas de diversión', estado: 'Publicada', util: 178, reportes: 0, fecha: '5 nov 2025, 05:20' },
    { id: 'rev-005', juego: 'Wyvern Quest', usuario: 'CasualGamer123', usuarioVerificado: true, rating: 3, titulo: 'Bueno pero muy exigente', estado: 'Publicada', util: 45, reportes: 0, fecha: '10 nov 2025, 07:30' },
    { id: 'rev-006', juego: 'Burnout VR', usuario: 'VRHorrorFan', usuarioVerificado: true, rating: 5, titulo: '¡Terror en su máxima expresión!', estado: 'Publicada', util: 201, reportes: 0, fecha: '12 nov 2025, 14:00' },
    { id: 'rev-007', juego: 'Burnout VR', usuario: 'ScaredEasily', usuarioVerificado: true, rating: 4, titulo: 'Demasiado aterrador para mí', estado: 'Publicada', util: 92, reportes: 0, fecha: '15 nov 2025, 12:30' },
    { id: 'rev-008', juego: 'Burnout VR', usuario: 'VREnthusiast', usuarioVerificado: true, rating: 5, titulo: 'Aprovecha al máximo la VR', estado: 'Publicada', util: 167, reportes: 0, fecha: '18 nov 2025, 09:45' },
    { id: 'rev-009', juego: 'Chainsaw of the Dead', usuario: 'NewPlayer2025', usuarioVerificado: false, rating: 4, titulo: 'Esperando revisión del adminis...', estado: 'Pendiente', util: 0, reportes: 0, fecha: '28 nov 2025, 04:00' },
    { id: 'rev-010', juego: 'Wyvern Quest', usuario: 'FantasyLover88', usuarioVerificado: true, rating: 5, titulo: 'El mundo de fantasía más detal...', estado: 'Publicada', util: 143, reportes: 0, fecha: '20 nov 2025, 06:00' }
  ];


  get filteredReviews() {
    return this.reviews.filter(r => {
      // 1. Filtro por Estado
      if (this.activeFilter !== 'todas') {
        if (this.activeFilter === 'publicadas' && r.estado !== 'Publicada') return false;
        if (this.activeFilter === 'pendientes' && r.estado !== 'Pendiente') return false;
        if (this.activeFilter === 'rechazadas' && r.estado !== 'Rechazada') return false;
      }


      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return r.usuario.toLowerCase().includes(term) ||
               r.juego.toLowerCase().includes(term) ||
               r.titulo.toLowerCase().includes(term);
      }

      return true;
    });
  }

  setFilter(filter: 'todas' | 'publicadas' | 'pendientes' | 'rechazadas') {
    this.activeFilter = filter;
  }



  aprobar(id: string) { alert('Reseña aprobada: ' + id); }
  rechazar(id: string) { alert('Reseña rechazada: ' + id); }

  eliminar(id: string) {
    if(confirm('¿Eliminar reseña permanentemente?')) {
      this.reviews = this.reviews.filter(r => r.id !== id);
    }
  }


  verResena(review: any) {
    this.selectedReview = { ...review };
    this.isEditing = false;
  }


  editarResena(review: any) {
    this.selectedReview = { ...review }; // Creamos una copia
    this.isEditing = true;
  }


  cerrarModal() {
    this.selectedReview = null;
    this.isEditing = false;
  }


  guardarCambios() {
    alert('Cambios guardados correctamente para: ' + this.selectedReview.id);
  
    const index = this.reviews.findIndex(r => r.id === this.selectedReview.id);
    if (index !== -1) {
      this.reviews[index] = { ...this.selectedReview };
    }
    this.cerrarModal();
  }
}
