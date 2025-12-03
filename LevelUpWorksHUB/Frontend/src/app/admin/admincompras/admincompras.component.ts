import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ComprasService, Compra } from '../../services/compras.service';

@Component({
  selector: 'app-admincompras',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admincompras.component.html',
  styleUrls: ['./admincompras.component.css']
})
export class AdminComprasComponent implements OnInit {

  compras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  searchTerm: string = '';

  cargando = false;
  errorMsg = '';

  // Estadísticas
  totalCompras = 0;
  completadas = 0;
  pendientes = 0;
  procesando = 0;
  canceladas = 0;
  ingresosTotales = 0;

  constructor(private comprasService: ComprasService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }


  cargarCompras(): void {
    this.cargando = true;
    this.errorMsg = '';

    this.comprasService.obtenerTodasLasCompras().subscribe({
      next: (res) => {
        this.cargando = false;

        if (res.exito && res.compras) {
          this.compras = res.compras;
          this.comprasFiltradas = [...this.compras];
          this.calcularEstadisticas();
          console.log('Compras cargadas:', this.compras);
        } else {
          this.errorMsg = res.mensaje || 'No se pudieron cargar las compras';
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error cargando compras:', err);
        this.errorMsg = 'Error en el servidor al cargar las compras';
      }
    });
  }


  calcularEstadisticas(): void {
    this.totalCompras = this.compras.length;
    this.completadas = this.compras.filter(c => c.estado === 'pagado').length;
    this.pendientes = this.compras.filter(c => c.estado === 'pendiente').length;
    this.procesando = this.compras.filter(c => c.estado === 'procesando').length;
    this.canceladas = this.compras.filter(c => c.estado === 'cancelado').length;
    this.ingresosTotales = this.compras.reduce((sum, c) => sum + (c.precio || 0), 0);
  }


  filtrarCompras(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.comprasFiltradas = [...this.compras];
      return;
    }

    this.comprasFiltradas = this.compras.filter(c => {
      return (
        c.comprasID.toString().includes(term) ||
        (c.username && c.username.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.nombreproducto && c.nombreproducto.toLowerCase().includes(term))
      );
    });
  }


  getEstadoBadgeClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'bg-green-700 text-green-200';
      case 'pendiente':
        return 'bg-blue-700 text-blue-200';
      case 'procesando':
        return 'bg-yellow-700 text-yellow-200';
      case 'cancelado':
        return 'bg-red-700 text-red-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  }


  getEstadoTexto(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'Completada';
      case 'pendiente':
        return 'Pendiente';
      case 'procesando':
        return 'Procesando';
      case 'cancelado':
        return 'Cancelada';
      default:
        return estado;
    }
  }


  eliminarCompra(compra: Compra): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar esta compra (ID: ${compra.comprasID})?`)) {
      return;
    }

    this.comprasService.eliminarCompra(compra.comprasID).subscribe({
      next: (res) => {
        if (res.exito) {
          alert('Compra eliminada correctamente');
          this.cargarCompras();
        } else {
          alert('Error al eliminar la compra: ' + res.mensaje);
        }
      },
      error: (err) => {
        console.error('Error eliminando compra:', err);
        alert('Error al eliminar la compra');
      }
    });
  }


  cambiarEstado(compra: Compra, nuevoEstado: string): void {
    this.comprasService.actualizarEstadoCompra(compra.comprasID, nuevoEstado).subscribe({
      next: (res) => {
        if (res.exito) {
          alert('Estado actualizado correctamente');
          this.cargarCompras();
        } else {
          alert('Error al actualizar: ' + res.mensaje);
        }
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        alert('Error al actualizar el estado');
      }
    });
  }

 
  verDetalles(compra: Compra): void {
    alert(`
      ID: ${compra.comprasID}
      Usuario: ${compra.username || 'N/A'} (${compra.usuarioid})
      Email: ${compra.email || 'N/A'}
      Producto: ${compra.nombreproducto}
      Descripción: ${compra.descripción}
      Precio: $${compra.precio}
      Divisa: ${compra.divisa}
      Estado: ${this.getEstadoTexto(compra.estado)}
      Fecha: ${new Date(compra.fechacompra).toLocaleDateString()}
    `);
  }
}
