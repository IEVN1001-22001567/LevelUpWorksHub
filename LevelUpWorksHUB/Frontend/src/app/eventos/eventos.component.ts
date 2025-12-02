import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './eventos.component.html',
})
export class EventosComponent implements OnInit {

  eventosDestacados: any[] = [];
  eventosActivos: any[] = [];
  eventosProximos: any[] = [];
  eventosPasados: any[] = [];

  private API_URL = 'http://127.0.0.1:5000/even_actu';

  // Modal
  eventoSeleccionado: any = null;
  modalVisible: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {
    this.http.get<any[]>(this.API_URL).subscribe({
      next: (data) => {
        console.log("EVENTOS RECIBIDOS →", data);

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

  imagenBase64(imagen: string | null): string {
    if (!imagen) return 'assets/no-image.png';
    return `data:image/jpeg;base64,${imagen}`;
  }

  // Modal
  abrirModal(evento: any) {
    this.eventoSeleccionado = evento;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.eventoSeleccionado = null;
  }

  // trackBy para ngFor (opcional)
  trackById(index: number, item: any) {
    return item.id;
  }

}
