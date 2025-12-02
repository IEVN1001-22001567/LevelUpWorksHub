import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ResenasService } from '../../services/resenas.service';

@Component({
  selector: 'app-admin-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminresenas.component.html',
  styles: []
})
export class AdminResenasComponent implements OnInit {

  activeFilter: 'todas' | 'publicadas' | 'pendientes' | 'rechazadas' = 'todas';
  searchTerm: string = '';

  selectedReview: any = null;
  isEditing: boolean = false;

  stats = {
    total: 0,
    publicadas: 0,
    pendientes: 0,
    ratingPromedio: 0
  };

  gameStats: any[] = [];
  reviews: any[] = [];
  juegos: any[] = [];
  baseUrl = 'http://127.0.0.1:5000';

  constructor(
    private resenasService: ResenasService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.cargarJuegos();
    this.cargarResenas();
  }

  cargarJuegos() {
    this.http.get<any>(`${this.baseUrl}/tienda`).subscribe(
      (data: any) => {
        if (data.exito && data.juegos) {
          this.juegos = data.juegos.map((j: any) => ({
            id: j.juegoID,
            nombre: j.titulo
          }));
        }
      },
      error => console.error('Error cargando juegos:', error)
    );
  }

  cargarResenas() {
    this.resenasService.obtenerResenasAdmin().subscribe(
      (data: any) => {
        if (data.exito) {
          this.reviews = (data.resenas || []).map((r: any) => ({
            ...r,
            id: r.resenaID,
            usuario: r.username,
            juego: r.nombre_juego,
            titulo: r.titulo,
            estado: r.estado === 'publicada' ? 'Publicada' : (r.estado === 'pendiente' ? 'Pendiente' : 'Rechazada'),
            util: r.util || 0,
            reportes: r.reportes || 0,
            fecha: r.fecha_publicacion || 'Sin fecha',
            rating: r.rating || 0,
            usuarioVerificado: false
          }));
          this.actualizarEstadisticas();
        }
      },
      error => console.error('Error cargando reseñas:', error)
    );
  }

  actualizarEstadisticas() {
    this.stats.total = this.reviews.length;
    this.stats.publicadas = this.reviews.filter(r => r.estado === 'Publicada').length;
    this.stats.pendientes = this.reviews.filter(r => r.estado === 'Pendiente').length;
    
    // Calcular rating promedio
    if (this.stats.publicadas > 0) {
      const suma = this.reviews
        .filter(r => r.estado === 'Publicada')
        .reduce((acc, r) => acc + r.rating, 0);
      this.stats.ratingPromedio = +(suma / this.stats.publicadas).toFixed(1);
    }

    // Estadísticas por juego
    const juegosMap = new Map();
    this.reviews.filter(r => r.estado === 'Publicada').forEach(r => {
      if (!juegosMap.has(r.juego)) {
        juegosMap.set(r.juego, { name: r.juego, ratings: [], count: 0 });
      }
      juegosMap.get(r.juego).ratings.push(r.rating);
      juegosMap.get(r.juego).count++;
    });

    this.gameStats = Array.from(juegosMap.values()).map((game: any) => ({
      name: game.name,
      rating: (game.ratings.reduce((a: number, b: number) => a + b, 0) / game.ratings.length).toFixed(1),
      count: game.count
    }));
  }

  get filteredReviews() {
    return this.reviews.filter(r => {
      if (this.activeFilter !== 'todas') {
        if (this.activeFilter === 'publicadas' && r.estado !== 'Publicada') return false;
        if (this.activeFilter === 'pendientes' && r.estado !== 'Pendiente') return false;
        if (this.activeFilter === 'rechazadas' && r.estado !== 'Rechazada') return false;
      }

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return r.usuario?.toLowerCase().includes(term) ||
               r.juego?.toLowerCase().includes(term) ||
               r.titulo?.toLowerCase().includes(term);
      }

      return true;
    });
  }

  setFilter(filter: 'todas' | 'publicadas' | 'pendientes' | 'rechazadas') {
    this.activeFilter = filter;
  }

  aprobar(id: number) {
    this.resenasService.aprobarResena(id).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Reseña aprobada');
          this.cargarResenas();
        } else {
          alert('Error: ' + (data.mensaje || 'No se pudo aprobar la reseña'));
        }
      },
      error => {
        console.error('Error aprobando reseña:', error);
        alert('Error aprobando reseña: ' + (error.error?.mensaje || error.statusText));
      }
    );
  }

  rechazar(id: number) {
    this.resenasService.rechazarResena(id).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Reseña rechazada');
          this.cargarResenas();
        } else {
          alert('Error: ' + (data.mensaje || 'No se pudo rechazar la reseña'));
        }
      },
      error => {
        console.error('Error rechazando reseña:', error);
        alert('Error rechazando reseña: ' + (error.error?.mensaje || error.statusText));
      }
    );
  }

  eliminar(id: number) {
    if(confirm('¿Eliminar reseña permanentemente?')) {
      this.resenasService.eliminarResena(id).subscribe(
        (data: any) => {
          if (data.exito) {
            alert('Reseña eliminada');
            this.cargarResenas();
          }
        },
        error => alert('Error eliminando reseña')
      );
    }
  }

  verResena(review: any) {
    this.selectedReview = { ...review };
    this.isEditing = false;
  }

  editarResena(review: any) {
    this.selectedReview = { ...review };
    this.isEditing = true;
  }

  cerrarModal() {
    this.selectedReview = null;
    this.isEditing = false;
  }

  guardarCambios() {
    if (this.selectedReview) {
      alert('Cambios guardados correctamente para: ' + this.selectedReview.id);
      this.cargarResenas();
      this.cerrarModal();
    }
  }
}
