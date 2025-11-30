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
    });
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

          return {
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
            ]
          };
        });
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

    this.carrito.agregarItem({
      id: juego.id,
      titulo: juego.titulo,
      precio: juego.precio,
      imagen: juego.imagen,
      cantidad: 1
    });

    // después de agregar al carrito, lo mandamos al carrito
    this.router.navigate(['/carrito']);
  }

  // ===== IR A LOGIN CON ROUTER =====
  irALogin() {
    this.router.navigate(['/login']);
  }
}
