import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { CarritoService } from '../services/carrito.service';

interface JuegoTienda {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  rating: number;
  reviews: string;
  tags: string[];
  plataforma: string;
  yaComprado?: boolean;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css'
})
export class TiendaComponent implements OnInit {

  baseUrl = 'http://127.0.0.1:5000';

  juegos: JuegoTienda[] = [];
  cargando = false;
  errorMsg = '';

  isLoggedIn = false;
  usuarioActual: Usuario | null = null;
  juegosComprados: number[] = [];  // IDs de juegos ya comprados

  faqs = [
    {
      pregunta: '¿Los juegos son compatibles con todas las plataformas?',
      respuesta: 'Todos nuestros juegos están desarrollados en Unity y son compatibles con PC Windows.'
    },
    {
      pregunta: '¿Hay reembolsos disponibles?',
      respuesta: 'Sí, ofrecemos reembolso completo dentro de las primeras 48 horas de compra si no has jugado más de 2 horas.'
    },
    {
      pregunta: '¿Los juegos reciben actualizaciones?',
      respuesta: 'Actualizamos constantemente nuestros juegos con nuevo contenido.'
    }
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private carrito: CarritoService
  ) {}

  ngOnInit(): void {
    this.suscribirUsuario();
    this.cargarJuegos();
  }

  // ===== SESIÓN =====
  suscribirUsuario() {
    this.auth.user$.subscribe((user) => {
      this.usuarioActual = user;
      this.isLoggedIn = !!user;

      // Cuando el usuario cambia, cargar sus juegos comprados
      if (user && user.usuarioid) {
        this.cargarJuegosComprados(user.usuarioid);
      } else {
        this.juegosComprados = [];
      }
    });
  }

  // ===== CARGAR JUEGOS COMPRADOS DEL USUARIO =====
  cargarJuegosComprados(usuarioid: number) {
    this.http.get<any>(`${this.baseUrl}/api/mis-juegos?usuarioid=${usuarioid}`).subscribe({
      next: (res: any) => {
        if (res && res.exito && res.juegos) {
          // Extraer los IDs de los juegos comprados
          this.juegosComprados = res.juegos.map((j: any) => j.juegoID);
          
          // Actualizar el estado de yaComprado en los juegos ya cargados
          this.actualizarEstadoJuegosComprados();
        }
      },
      error: (err: any) => {
        console.error('Error cargando juegos comprados:', err);
      }
    });
  }

  // ===== ACTUALIZAR ESTADO DE JUEGOS COMPRADOS =====
  actualizarEstadoJuegosComprados() {
    this.juegos = this.juegos.map((juego) => ({
      ...juego,
      yaComprado: this.juegosComprados.includes(juego.id)
    }));
  }

  // ===== CARGAR JUEGOS DESDE /tienda =====
  cargarJuegos() {
    this.cargando = true;
    this.errorMsg = '';

    this.http.get<any>(`${this.baseUrl}/tienda`).subscribe({
      next: (res: any) => {
        this.cargando = false;

        if (!res || !res.exito) {
          this.errorMsg = res?.mensaje || 'No se pudieron cargar los juegos';
          return;
        }

        this.juegos = (res.juegos || []).map((j: any): JuegoTienda => {
          const portadaNombre = j.portada;
          const imagenUrl = portadaNombre
            ? `${this.baseUrl}/static/portadas/${portadaNombre}`
            : 'assets/img/placeholder_game.jpg';

          const juego: JuegoTienda = {
            id: Number(j.juegoID ?? 0),
            titulo: j.titulo ?? 'Sin título',
            descripcion: j.descripcion ?? '',
            precio: Number(j.precio ?? 0),
            imagen: imagenUrl,
            categoria: j.genero ?? 'Indefinido',
            plataforma: j.plataforma ?? 'PC',
            rating: 4.8,
            reviews: '1,000+',
            tags: [
              j.plataforma ?? 'PC',
              j.genero ?? 'RPG',
              'Unity Engine'
            ],
            yaComprado: this.juegosComprados.includes(Number(j.juegoID ?? 0))
          };
          return juego;
        });

        // Después de cargar los juegos, actualizar estado de comprados
        this.actualizarEstadoJuegosComprados();
      },
      error: (err: any) => {
        console.error('Error cargando juegos tienda:', err);
        this.cargando = false;
        this.errorMsg = 'Error en el servidor al cargar juegos';
      }
    });
  }

  // ===== COMPRAR =====
  onComprar(juego: JuegoTienda) {
    if (!this.isLoggedIn || !this.usuarioActual) {
      this.irALogin();
      return;
    }

    const agregado = this.carrito.agregarItem({
      id: juego.id,
      titulo: juego.titulo,
      precio: juego.precio,
      imagen: juego.imagen,
      cantidad: 1
    });

    if (agregado) {
      // después de agregar al carrito, lo mandamos al carrito
      this.router.navigate(['/carrito']);
    } else {
      // Mostrar alerta si el juego ya está en el carrito
      alert(`${juego.titulo} ya está en tu carrito. Solo puedes comprar una copia de cada juego.`);
    }
  }

  // ===== VER EN BIBLIOTECA =====
  irABiblioteca() {
    this.router.navigate(['/biblioteca']);
  }

  // ===== IR A LOGIN CON ROUTER =====
  irALogin() {
    this.router.navigate(['/login']);
  }
}
