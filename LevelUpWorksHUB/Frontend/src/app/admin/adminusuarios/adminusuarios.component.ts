// src/app/admin/adminusuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type RolUsuario = 'admin' | 'client';
type EstadoUsuario = 'active' | 'inactive';

interface Usuario {
  
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  miembroDesde: string;
  comprasTotales: number;
  gastoTotal: number;
  ultimoAcceso: string;
  
  
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminusuarios.component.html',
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];

  // filtros
  terminoBusqueda = '';
  filtroRol: 'all' | RolUsuario = 'all';
  filtroEstado: 'all' | EstadoUsuario = 'all';

  // edición
  usuarioEditando: Usuario | null = null;
  modalEditarOpen = false;

  // NUEVO: modal para crear usuario
  modalNuevoOpen = false;
  nuevoUsuario = {
    username: '',
    email: '',
    password: '',
    nombre: '',
    telefono: '',
    rol: 'client' as RolUsuario
  };

  cargando = false;
  errorMsg = '';
  successMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.get<any>('http://127.0.0.1:5000/admin/usuarios')
      .subscribe({
        next: (res) => {
          this.cargando = false;
          if (res.exito && Array.isArray(res.usuarios)) {
            this.usuarios = res.usuarios.map((u: any) => ({
              id: u.id,
              nombre: u.nombre || u.username || 'Sin nombre',
              email: u.email,
              avatar: u.avatar
                ? `http://127.0.0.1:5000/static/avatars/${u.avatar}`
                : undefined,
              rol: (u.rol === 'admin' ? 'admin' : 'client') as RolUsuario,
              estado: (u.estado || 'active') as EstadoUsuario,
              miembroDesde: u.miembroDesde || '2024-01-01',
              comprasTotales: u.comprasTotales ?? 0,
              gastoTotal: u.gastoTotal ?? 0,
              ultimoAcceso: u.ultimoAcceso || '2024-01-01'
            }));
          } else {
            this.errorMsg = res.mensaje || 'No se pudieron cargar los usuarios';
          }
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al cargar usuarios:', err);
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al cargar usuarios';
        }
      });
  }

  // getters de estadísticas...
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

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(u => {
      const term = this.terminoBusqueda.trim().toLowerCase();
      const coincideBusqueda =
        !term ||
        (u.nombre && u.nombre.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term));
      const coincideRol = this.filtroRol === 'all' || u.rol === this.filtroRol;
      const coincideEstado = this.filtroEstado === 'all' || u.estado === this.filtroEstado;
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }

  // ====== EDICIÓN EXISTENTE ======
  editarUsuario(u: Usuario) {
    this.usuarioEditando = { ...u };
    this.modalEditarOpen = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  guardarEdicion() {
    if (!this.usuarioEditando) return;

    const body = {
      nombre: this.usuarioEditando.nombre,
      email: this.usuarioEditando.email,
      rol: this.usuarioEditando.rol
    };

    this.http.put<any>(`http://127.0.0.1:5000/admin/usuarios/${this.usuarioEditando.id}`, body)
      .subscribe({
        next: (res) => {
          if (res.exito) {
            this.usuarios = this.usuarios.map(u =>
              u.id === this.usuarioEditando!.id ? { ...this.usuarioEditando! } : u
            );
            this.successMsg = 'Usuario actualizado correctamente';
            this.usuarioEditando = null;
            this.modalEditarOpen = false;
          } else {
            this.errorMsg = res.mensaje || 'No se pudo actualizar el usuario';
          }
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al actualizar usuario';
        }
      });
  }

  cancelarEdicion() {
    this.usuarioEditando = null;
    this.modalEditarOpen = false;
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    this.http.delete<any>(`http://127.0.0.1:5000/admin/usuarios/${id}`)
      .subscribe({
        next: (res) => {
          if (res.exito) {
            this.usuarios = this.usuarios.filter(u => u.id !== id);
            this.successMsg = 'Usuario eliminado correctamente';
          } else {
            this.errorMsg = res.mensaje || 'No se pudo eliminar el usuario';
          }
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al eliminar usuario';
        }
      });
  }

  alternarEstado(id: number) {
    this.usuarios = this.usuarios.map(u =>
      u.id === id
        ? { ...u, estado: u.estado === 'active' ? 'inactive' : 'active' }
        : u
    );
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.filtroRol = 'all';
    this.filtroEstado = 'all';
  }

  formatoFecha(fechaIso: string) {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ====== NUEVO USUARIO ======
  abrirModalNuevoUsuario() {
    this.modalNuevoOpen = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.nuevoUsuario = {
      username: '',
      email: '',
      password: '',
      nombre: '',
      telefono: '',
      rol: 'client'
    };
  }

  cerrarModalNuevoUsuario() {
    this.modalNuevoOpen = false;
  }

  crearUsuario() {
    if (!this.nuevoUsuario.username || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      this.errorMsg = 'Username, email y contraseña son obligatorios';
      return;
    }

    const body = {
      username: this.nuevoUsuario.username,
      email: this.nuevoUsuario.email,
      password: this.nuevoUsuario.password,
      nombre: this.nuevoUsuario.nombre,
      telefono: this.nuevoUsuario.telefono,
      rol: this.nuevoUsuario.rol
    };

    this.http.post<any>('http://127.0.0.1:5000/admin/usuarios', body)
      .subscribe({
        next: (res) => {
          if (res.exito && res.usuario) {
            // añadir al arreglo para que se vea al instante
            const u = res.usuario;
            const nuevo: Usuario = {
              id: u.id,
              nombre: u.nombre || u.username || 'Sin nombre',
              email: u.email,
              avatar: u.avatar
                ? `http://127.0.0.1:5000/static/avatars/${u.avatar}`
                : undefined,
              rol: (u.rol === 'admin' ? 'admin' : 'client') as RolUsuario,
              estado: (u.estado || 'active') as EstadoUsuario,
              miembroDesde: u.miembroDesde || '2024-01-01',
              comprasTotales: u.comprasTotales ?? 0,
              gastoTotal: u.gastoTotal ?? 0,
              ultimoAcceso: u.ultimoAcceso || '2024-01-01'
            };
            this.usuarios = [nuevo, ...this.usuarios];
            this.successMsg = 'Usuario creado correctamente';
            this.modalNuevoOpen = false;
          } else {
            this.errorMsg = res.mensaje || 'No se pudo crear el usuario';
          }
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al crear usuario';
        }
      });
  }
}
