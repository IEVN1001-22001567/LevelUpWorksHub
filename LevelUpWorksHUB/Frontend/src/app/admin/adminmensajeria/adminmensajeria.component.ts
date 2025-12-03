import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-mensajeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminmensajeria.component.html',
  styles: []
})
export class AdminMensajeriaComponent implements OnInit {

  private apiUrl = 'http://127.0.0.1:5000/api/social';
  private adminUrl = 'http://127.0.0.1:5000/api/admin';

  activeTab: 'usuarios' | 'mensajes' | 'reportes' | 'configuracion' = 'usuarios';

  usuarios: any[] = [];
  mensajesRecientes: any[] = [];
  reportes: any[] = [];
  selectedUsuario: any = null;
  selectedMensaje: any = null;

  cargando = false;
  errorMsg = '';

  config = {
    limiteMensajes: 50,
    longitudMaxima: 500,
    moderacionAutomatica: true,
    notificarEquipo: true
  };

  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarUsuarios();
    this.cargarMensajesDelSistema();
    this.cargarReportes();
  }

  cargarUsuarios() {
    this.cargando = true;
    // Intentar obtener del admin, si falla usar datos vacíos
    this.http.get<any>(`${this.adminUrl}/usuarios`).subscribe(
      (data: any) => {
        if (data.exito) {
          this.usuarios = data.usuarios || [];
        }
        this.cargando = false;
      },
      error => {
        console.error('Error cargando usuarios del admin:', error);
        this.cargando = false;
        this.usuarios = [];
      }
    );
  }

  cargarMensajesDelSistema() {
    // Obtener todos los mensajes del sistema
    this.http.get<any>(`${this.apiUrl}/historial-completo`).subscribe(
      (data: any) => {
        if (data.exito && data.mensajes) {
          this.mensajesRecientes = data.mensajes.map((m: any) => ({
            mensaje_id: m.mensaje_id,
            remitente_id: m.remitente_id,
            remitente_username: m.remitente_username,
            destinatario_id: m.destinatario_id,
            destinatario_username: m.destinatario_username,
            contenido: m.contenido,
            fecha_envio: m.fecha_envio,
            leido: m.leido,
            reportado: m.reportado || false
          }));
        }
      },
      error => {
        console.error('Error cargando mensajes:', error);
        this.cargarMensajesAlternativo();
      }
    );
  }

  cargarMensajesAlternativo() {
    this.http.get<any>(`${this.adminUrl}/mensajes`).subscribe(
      (data: any) => {
        if (data.exito) {
          this.mensajesRecientes = data.mensajes || [];
        }
      },
      error => console.error('Error en fallback de mensajes:', error)
    );
  }

  cargarReportes() {
    this.http.get<any>(`${this.adminUrl}/reportes-mensajeria`).subscribe(
      (data: any) => {
        if (data.exito) {
          this.reportes = data.reportes || [];
        }
      },
      error => console.error('Error cargando reportes:', error)
    );
  }

  setTab(tab: 'usuarios' | 'mensajes' | 'reportes' | 'configuracion') {
    this.activeTab = tab;
  }

  banearUsuario(id: number) {
    if (confirm('¿Está seguro de que desea banear a este usuario?')) {
      this.http.post<any>(`${this.adminUrl}/usuarios/${id}/banear`, {}).subscribe(
        (data: any) => {
          if (data.exito) {
            alert('Usuario baneado correctamente');
            this.cargarUsuarios();
          }
        },
        error => {
          console.error('Error baneando usuario:', error);
          alert('Error al banear al usuario');
        }
      );
    }
  }

  desbanearUsuario(id: number) {
    this.http.post<any>(`${this.adminUrl}/usuarios/${id}/desbanear`, {}).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Usuario desbaneado correctamente');
          this.cargarUsuarios();
        }
      },
      error => {
        console.error('Error desbaneando usuario:', error);
        alert('Error al desbanear al usuario');
      }
    );
  }

  verMensaje(mensaje: any) {
    this.selectedMensaje = mensaje;
  }

  cerrarModal() {
    this.selectedMensaje = null;
    this.selectedUsuario = null;
  }

  eliminarMensaje(id: number) {
    if (confirm('¿Eliminar este mensaje?')) {
      this.http.delete<any>(`${this.apiUrl}/mensaje/${id}`).subscribe(
        (data: any) => {
          if (data.exito) {
            alert('Mensaje eliminado');
            this.cargarMensajesDelSistema();
            this.cerrarModal();
          }
        },
        error => {
          console.error('Error eliminando mensaje:', error);
          alert('Error al eliminar el mensaje');
        }
      );
    }
  }

  reportarMensaje(id: number) {
    this.http.post<any>(`${this.apiUrl}/reportar/${id}`, {}).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Mensaje reportado');
          this.cargarMensajesDelSistema();
        }
      },
      error => {
        console.error('Error reportando mensaje:', error);
        alert('Error al reportar el mensaje');
      }
    );
  }

  resolverReporte(reporteId: number, accion: 'eliminar' | 'advertencia' | 'ignorar') {
    this.http.post<any>(`${this.adminUrl}/reportes/${reporteId}/resolver`, { accion }).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Reporte resuelto');
          this.cargarReportes();
          this.cargarMensajesDelSistema();
        }
      },
      error => {
        console.error('Error resolviendo reporte:', error);
        alert('Error al resolver el reporte');
      }
    );
  }

  guardarConfiguracion() {
    this.http.post<any>(`${this.adminUrl}/configuracion-mensajeria`, this.config).subscribe(
      (data: any) => {
        if (data.exito) {
          alert('Configuración guardada correctamente');
        }
      },
      error => {
        console.error('Error guardando configuración:', error);
        alert('Error al guardar la configuración');
      }
    );
  }

  get usuariosFiltrados() {
    if (!this.searchTerm) return this.usuarios;
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term)
    );
  }

  get statsUsuarios() {
    return this.usuarios.length;
  }

  get statsMensajes() {
    return this.mensajesRecientes.length;
  }

  get statsReportes() {
    return this.reportes.filter((r: any) => r.estado === 'pendiente').length;
  }

  get statsBaneados() {
    return this.usuarios.filter((u: any) => u.baneado).length;
  }
}
