import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RolUsuario = 'admin' | 'client';
type EstadoUsuario = 'active' | 'inactive';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  miembroDesde: string; // ISO date string
  comprasTotales: number;
  gastoTotal: number;
  ultimoAcceso: string; // ISO date string
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminusuarios.component.html',
})
export class AdminUsuariosComponent {
  usuarios: Usuario[] = [
    {
      id: 'admin-1',
      nombre: 'Admin Level Up Hub',
      email: 'admin@leveluphub.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      rol: 'admin',
      estado: 'active',
      miembroDesde: '2023-01-15',
      comprasTotales: 0,
      gastoTotal: 0,
      ultimoAcceso: '2025-11-14'
    },
    {
      id: '1',
      nombre: 'Carlos Méndez',
      email: 'carlos.mendez@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-03-20',
      comprasTotales: 3,
      gastoTotal: 144.97,
      ultimoAcceso: '2025-11-14'
    },
    {
      id: '2',
      nombre: 'María González',
      email: 'maria.gonzalez@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-05-12',
      comprasTotales: 2,
      gastoTotal: 104.98,
      ultimoAcceso: '2025-11-13'
    },
    {
      id: '3',
      nombre: 'Juan Rodríguez',
      email: 'juan.rodriguez@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-07-08',
      comprasTotales: 1,
      gastoTotal: 49.99,
      ultimoAcceso: '2025-11-12'
    },
    {
      id: '4',
      nombre: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-08-22',
      comprasTotales: 3,
      gastoTotal: 144.97,
      ultimoAcceso: '2025-11-14'
    },
    {
      id: '5',
      nombre: 'Pedro López',
      email: 'pedro.lopez@example.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      rol: 'client',
      estado: 'inactive',
      miembroDesde: '2024-02-10',
      comprasTotales: 0,
      gastoTotal: 0,
      ultimoAcceso: '2025-09-20'
    },
    {
      id: '6',
      nombre: 'Laura Fernández',
      email: 'laura.fernandez@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-09-15',
      comprasTotales: 2,
      gastoTotal: 94.98,
      ultimoAcceso: '2025-11-13'
    },
    {
      id: '7',
      nombre: 'David Sánchez',
      email: 'david.sanchez@example.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      rol: 'client',
      estado: 'active',
      miembroDesde: '2024-10-01',
      comprasTotales: 1,
      gastoTotal: 54.99,
      ultimoAcceso: '2025-11-11'
    }
  ];

  // filtros y búsqueda
  terminoBusqueda = '';
  filtroRol: 'all' | RolUsuario = 'all';
  filtroEstado: 'all' | EstadoUsuario = 'all';

  // edición
  usuarioEditando: Usuario | null = null;
  modalEditarOpen = false;

  // estadisticas (getters para que siempre estén actualizadas)
  get totalUsuarios() { return this.usuarios.length; }
  get cantidadAdmins() { return this.usuarios.filter(u => u.rol === 'admin').length; }
  get cantidadClientes() { return this.usuarios.filter(u => u.rol === 'client').length; }
  get usuariosActivos() { return this.usuarios.filter(u => u.estado === 'active').length; }
  get nuevosEsteMes() {
    const now = new Date();
    return this.usuarios.filter(u => {
      const d = new Date(u.miembroDesde);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }
  get ingresosTotales() { return this.usuarios.reduce((s, u) => s + u.gastoTotal, 0); }

  // filtro aplicado
  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const term = this.terminoBusqueda.trim().toLowerCase();
      const coincideBusqueda = !term || u.nombre.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      const coincideRol = this.filtroRol === 'all' || u.rol === this.filtroRol;
      const coincideEstado = this.filtroEstado === 'all' || u.estado === this.filtroEstado;
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }

  // acciones
  editarUsuario(u: Usuario) {
    // copia para evitar mutaciones en vivo
    this.usuarioEditando = { ...u };
    this.modalEditarOpen = true;
  }

  guardarEdicion() {
    if (!this.usuarioEditando) return;
    this.usuarios = this.usuarios.map(u => u.id === this.usuarioEditando!.id ? { ...this.usuarioEditando! } : u);
    this.usuarioEditando = null;
    this.modalEditarOpen = false;
  }

  cancelarEdicion() {
    this.usuarioEditando = null;
    this.modalEditarOpen = false;
  }

  eliminarUsuario(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    this.usuarios = this.usuarios.filter(u => u.id !== id);
  }

  alternarEstado(id: string) {
    this.usuarios = this.usuarios.map(u => u.id === id ? { ...u, estado: u.estado === 'active' ? 'inactive' : 'active' } : u);
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.filtroRol = 'all';
    this.filtroEstado = 'all';
  }

  formatoFecha(fechaIso: string) {
    const d = new Date(fechaIso);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

