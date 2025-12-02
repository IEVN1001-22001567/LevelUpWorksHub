import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ResenasService } from '../services/resenas.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.component.html',
  styles: []
})
export class ResenasComponent implements OnInit {

  baseUrl = 'http://127.0.0.1:5000';

  juegoID: number | null = null;
  ratingPromedio: number = 0;
  totalResenas: number = 0;

  filters = {
    game: 'Todos los juegos',
    rating: 'Todos los ratings',
    sort: 'Más recientes'
  };

  reviews: any[] = [];
  juegos: any[] = [];
  gameStats: any[] = [];


  mostrarModalResena = false;
  nuevaResena = {
    titulo: '',
    contenido: '',
    rating: 5
  };

  usuarioActual: any = null;

  constructor(
    private resenasService: ResenasService,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.cargarUsuario();
    this.cargarJuegos();

  }

  cargarUsuario() {
    this.auth.user$.subscribe(user => {
      this.usuarioActual = user;
    });
  }

  cargarJuegos() {
    this.http.get<any>(`${this.baseUrl}/tienda`).subscribe(
      (data: any) => {
        if (data.exito && data.juegos) {
          this.juegos = data.juegos.map((j: any) => ({
            id: j.juegoID,
            name: j.titulo
          }));
          this.cargarEstadisticasJuegos();
          this.cargarResenasGenerales();
        }
      },
      error => console.error('Error cargando juegos:', error)
    );
  }

  cargarEstadisticasJuegos() {
    this.gameStats = [];
    this.juegos.forEach((juego: any) => {
      this.resenasService.obtenerRatingJuego(juego.id).subscribe(
        (data: any) => {
          if (data.exito) {
            this.gameStats.push({
              name: juego.name,
              rating: data.rating_promedio || 0,
              count: data.total_resenas || 0
            });
          }
        },
        error => console.error(`Error cargando rating del juego ${juego.id}:`, error)
      );
    });
  }

cargarResenasGenerales() {
  this.reviews = [];

  this.juegos.forEach((juego: any) => {
    this.resenasService.obtenerResenasJuego(juego.id).subscribe(
      (data: any) => {
        if (data.exito && data.resenas) {

          // 🔥 Aquí asignamos nombre_juego para que tu filtro funcione
          const resenasConNombre = data.resenas.map((r: any) => ({
            ...r,
            nombre_juego: juego.name
          }));

          this.reviews = [...this.reviews, ...resenasConNombre];
        }
      },
      error => console.error(`Error cargando reseñas del juego ${juego.id}:`, error)
    );
  });
}


  cargarResenas() {
    if (!this.juegoID) return;

    this.resenasService.obtenerResenasJuego(this.juegoID).subscribe(
      (data: any) => {
        if (data.exito) {
          this.reviews = data.resenas || [];
        }
      },
      error => console.error('Error cargando reseñas:', error)
    );
  }

  cargarDemostracion() {
    this.reviews = [
      {
        resenaID: 1,
        username: 'DragonSlayer01',
        titulo: 'El mundo de fantasía más detallado',
        fecha_publicacion: '20 nov 2025',
        rating: 5,
        contenido: 'La atención al detalle en este juego es asombrosa. Cada aldea tiene su propia cultura, las misiones secundarias son tan buenas como la principal, y el lore es profundísimo.',
        util: 0
      },
      {
        resenaID: 2,
        username: 'VREnthusiast',
        titulo: 'Aprovecha al máximo la VR',
        fecha_publicacion: '18 nov 2025',
        rating: 5,
        contenido: 'Los controles en VR son intuitivos y la experiencia es increíblemente inmersiva. El mejor juego de terror VR del momento.',
        util: 167
      },
      {
        resenaID: 3,
        username: 'ScaredEasily',
        titulo: 'Demasiado aterrador para mí',
        fecha_publicacion: '15 nov 2025',
        rating: 4,
        contenido: 'Es un juego increíble técnicamente, pero es tan aterrador que no puedo jugar más de 20 minutos seguidos.',
        util: 92
      }
    ];
  }

  escribirResena() {
    this.mostrarModalResena = true;
  }

  enviarResena() {
    if (!this.juegoID) {
      alert('Por favor selecciona un juego');
      return;
    }
    if (!this.usuarioActual) {
      alert('Debes estar logueado para crear una reseña');
      return;
    }
    if (!this.nuevaResena.titulo || !this.nuevaResena.contenido) {
      alert('Completa todos los campos');
      return;
    }

    const resena = {
      juegoID: this.juegoID,
      usuarioid: this.usuarioActual.usuarioid,
      titulo: this.nuevaResena.titulo,
      contenido: this.nuevaResena.contenido,
      rating: this.nuevaResena.rating
    };

    this.resenasService.crearResena(resena).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Reseña creada correctamente. Pendiente de aprobación del administrador.');
          this.nuevaResena = { titulo: '', contenido: '', rating: 5 };
          this.juegoID = null;
          this.mostrarModalResena = false;
          this.cargarResenasGenerales();
        }
      },
      error => {
        if (error.status === 403) {
          alert('No has comprado este juego. Solo puedes reseñar juegos que hayas adquirido.');
        } else {
          alert('Error al crear la reseña');
        }
        console.error(error);
      }
    );
  }

  cerrarModal() {
    this.mostrarModalResena = false;
    this.nuevaResena = { titulo: '', contenido: '', rating: 5 };
  }

  votarUtil(id: number) {
    this.resenasService.votarUtil(id).subscribe(
      (data: any) => {
        if (data.exito) {
          const review = this.reviews.find((r: any) => r.resenaID === id);
          if (review) review.util++;
        }
      },
      error => console.error('Error votando:', error)
    );
  }

  filtrarPorJuego(juegoID: number) {
  this.resenasService.obtenerResenasPorJuego(juegoID).subscribe((res: any) => {
    if (res.exito) {
      this.reviews = res.resenas;
    }
  });
}

aplicarFiltros() {

  let lista = [...this.reviews];

  if (this.filters.game !== 'Todos los juegos') {
    lista = lista.filter(r => r.nombre_juego === this.filters.game);
  }

  if (this.filters.rating !== 'Todos los ratings') {
    const estrellas = parseInt(this.filters.rating.charAt(0));
    lista = lista.filter(r => r.rating === estrellas);
  }

  if (this.filters.sort === 'Más recientes') {
    lista = lista.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  } else {
    lista = lista.sort((a, b) => (b.util || 0) - (a.util || 0));
  }

  this.reviews = lista;
}



  get reviewsFiltradas() {
    let filtradas = [...this.reviews];

    // Filtrar por juego
    if (this.filters.game !== 'Todos los juegos') {
      filtradas = filtradas.filter(r => r.nombre_juego === this.filters.game);
    }

    if (this.filters.rating !== 'Todos los ratings') {
      const ratingNum = parseInt(this.filters.rating.split(' ')[0]);
      filtradas = filtradas.filter(r => r.rating === ratingNum);
    }

    if (this.filters.sort === 'Más recientes') {
      filtradas.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
    } else if (this.filters.sort === 'Más útiles') {
      filtradas.sort((a, b) => (b.util || 0) - (a.util || 0));
    }

    return filtradas;
  }
}
