import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminsoporte.component.html'
})
export class AdminSoporteComponent implements OnInit {

  tickets: any[] = [];
  filtro: string = "Todos";

  stats = {
    abiertos: 0,
    enProceso: 0,
    resueltos: 0,
    alta: 0
  };

  modalEditar = false;
  ticketEditando: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets() {
    this.http.get<any[]>('http://127.0.0.1:5000/admin/tickets')
      .subscribe(data => {
        this.tickets = data;
        this.calcularEstadisticas();
      });
  }

  calcularEstadisticas() {
    this.stats.abiertos = this.tickets.filter(t => t.estado === 'Abierto').length;
    this.stats.enProceso = this.tickets.filter(t => t.estado === 'En Proceso').length;
    this.stats.resueltos = this.tickets.filter(t => t.estado === 'Resuelto').length;

    // Alta prioridad si en tu BD manejas alguna lógica extra
    this.stats.alta = 2;
  }

  ticketsFiltrados() {
    if (this.filtro === "Todos") return this.tickets;
    return this.tickets.filter(t => t.estado === this.filtro);
  }

  abrirModalEditar(ticket: any) {
    this.ticketEditando = { ...ticket };
    this.modalEditar = true;
  }

  guardarCambios() {
    this.http.put(`http://127.0.0.1:5000/admin/tickets/${this.ticketEditando.id_ticket}`, {
      estado: this.ticketEditando.estado
    }).subscribe(() => {
      this.modalEditar = false;
      this.cargarTickets();
    });
  }

  eliminarTicket(id: number) {
    if (!confirm("¿Eliminar ticket permanentemente?")) return;

    this.http.delete(`http://127.0.0.1:5000/admin/tickets/${id}`)
      .subscribe(() => this.cargarTickets());
  }

}
