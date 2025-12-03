import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para el buscador

@Component({
  selector: 'app-admin-licencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminlicencias.component.html',
  styles: []
})
export class AdminLicenciasComponent {

  stats = {
    total: 3,
    activas: 3,
    expiradas: 0,
    suspendidas: 0
  };

  licencias = [
    {
      id: 1,
      userId: '1',
      juego: 'Chainsaw of the Dead',
      clave: 'CZOD-XXXX-YYYY-ZZZZ-1234',
      estado: 'Activa',
      descargas: '2/5',
      plataforma: 'PC Windows',
      fecha: '31/10/2024'
    },
    {
      id: 2,
      userId: '1',
      juego: 'Wyvern Quest',
      clave: 'WQST-AAAA-BBBB-CCCC-5678',
      estado: 'Activa',
      descargas: '1/5',
      plataforma: 'PC Windows',
      fecha: '09/11/2024'
    },
    {
      id: 3,
      userId: 'admin-1',
      juego: 'Chainsaw of the Dead',
      clave: 'CZOD-ADMIN-TEST-KEY-0001',
      estado: 'Activa',
      descargas: '0/999',
      plataforma: 'PC Windows',
      fecha: '31/12/2023'
    }
  ];

  searchTerm: string = '';

  eliminarLicencia(id: number) {
    if(confirm('¿Estás seguro de eliminar esta licencia? El usuario perderá acceso al juego.')) {
      this.licencias = this.licencias.filter(l => l.id !== id);
    }
  }

  agregarLicencia() {
    alert('Abrir modal para generar nueva licencia');
  }
}
