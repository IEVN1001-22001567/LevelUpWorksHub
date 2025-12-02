import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
})
export class EventosComponent implements OnInit {

  eventosDestacados: any[] = [];
  eventosActivos: any[] = [];
  eventosProximos: any[] = [];
  eventosPasados: any[] = [];

  private API_URL = 'http://127.0.0.1:5000/even_actu';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {
    this.http.get<any[]>(this.API_URL).subscribe({
      next: (data) => {
        console.log("EVENTOS RECIBIDOS →", data);

        // Separar eventos según su categoría
        this.eventosDestacados = data.filter(e => e.destacado);
        this.eventosActivos = data.filter(e => e.estado === 'activo');
        this.eventosProximos = data.filter(e => e.estado === 'proximo');
        this.eventosPasados = data.filter(e => e.estado === 'pasado');
      },
      error: (err) => {
        console.error("Error al cargar eventos", err);
      }
    });
  }

  // Convierte la imagen base64 en formato válido
  imagenBase64(imagen: string | null): string {
    if (!imagen) {
      return 'assets/no-image.png'; // fallback opcional
    }
    return `data:image/jpeg;base64,${imagen}`;
  }

}
