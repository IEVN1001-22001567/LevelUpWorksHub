import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-compras.component.html',
  styleUrls: ['./gestion-compras.component.css']
})
export class GestionComprasComponent {

  compras = [
    {
      id: 'PUR-289879',
      cliente: 'Admin Level Up Hub',
      email: 'admin@leveluphub.com',
      productos: '1 producto(s)',
      total: 46.39,
      estado: 'Completada',
      fecha: '27 nov 2025'
    },
    {
      id: 'PUR-001',
      cliente: 'Gamer Pro',
      email: 'gamer@example.com',
      productos: '1 producto(s)',
      total: 57.99,
      estado: 'Completada',
      fecha: '1 nov 2024'
    }
  ];

  constructor() {}

}
