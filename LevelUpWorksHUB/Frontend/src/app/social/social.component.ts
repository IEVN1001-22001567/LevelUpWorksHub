import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService, Amigo, Mensaje } from '../services/social.service';
import { AuthService, Usuario } from '../services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-social',
  templateUrl: './social.component.html',
  imports: [CommonModule, FormsModule]
})
export class SocialComponent implements OnInit, OnDestroy {

  usuario: Usuario | null = null;

  amigos: Amigo[] = [];
  solicitudes: any[] = [];
  usuariosBusqueda: any[] = [];
  mensajesChat: Mensaje[] = [];

  amigoSeleccionadoId: number | null = null;
  amigoSeleccionadoNombre: string = '';

  mensajeActual: string = '';
  terminoBusqueda: string = '';
  
  cargando = false;
  errorMsg = '';
  successMsg = '';
  modalBusquedaOpen = false;
  tabActivo: 'amigos' | 'solicitudes' = 'amigos';

  private refreshInterval: Subscription | null = null;

  constructor(
    private socialService: SocialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario();
    
    if (this.usuario) {
      this.cargarAmigos();
      this.cargarSolicitudes();
      this.actualizarEstadoOnline();
      
      this.refreshInterval = interval(10000).subscribe(() => {
        if (this.usuario) {
          this.cargarAmigos();
          this.cargarSolicitudes();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.usuario) {
      this.actualizarEstadoOffline();
    }
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }


  cargarAmigos(): void {
    if (!this.usuario) return;

    this.socialService.obtenerAmigos(this.usuario.usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.amigos = res.amigos;
        }
      },
      error: (err) => {
        console.error('Error cargando amigos:', err);
      }
    });
  }

  cargarSolicitudes(): void {
    if (!this.usuario) return;

    this.socialService.obtenerSolicitudes(this.usuario.usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.solicitudes = res.solicitudes;
        }
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
      }
    });
  }


  abrirBusqueda(): void {
    this.modalBusquedaOpen = true;
    this.terminoBusqueda = '';
    this.usuariosBusqueda = [];
    this.errorMsg = '';
  }


  cerrarBusqueda(): void {
    this.modalBusquedaOpen = false;
  }


  buscar(): void {
    if (!this.usuario || this.terminoBusqueda.length < 2) {
      this.usuariosBusqueda = [];
      return;
    }

    this.socialService.buscarUsuarios(this.terminoBusqueda, this.usuario.usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.usuariosBusqueda = res.usuarios;
        }
      },
      error: (err) => {
        console.error('Error buscando usuarios:', err);
        this.errorMsg = 'Error al buscar usuarios';
      }
    });
  }


  enviarSolicitudAmistad(usuarioid: number): void {
    if (!this.usuario) return;

    this.socialService.agregarAmigo(this.usuario.usuarioid, usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.successMsg = 'Solicitud enviada correctamente';
          this.usuariosBusqueda = this.usuariosBusqueda.filter(u => u.usuarioid !== usuarioid);
          setTimeout(() => this.successMsg = '', 3000);
        }
      },
      error: (err) => {
        console.error('Error enviando solicitud:', err);
        this.errorMsg = err.error?.mensaje || 'Error al enviar solicitud';
      }
    });
  }


  seleccionarAmigo(amigo: Amigo): void {
    this.amigoSeleccionadoId = amigo.id;
    this.amigoSeleccionadoNombre = amigo.nombre;
    this.cargarMensajes();
  }

  cargarMensajes(): void {
    if (!this.usuario || !this.amigoSeleccionadoId) return;

    this.socialService.obtenerMensajes(this.usuario.usuarioid, this.amigoSeleccionadoId).subscribe({
      next: (res) => {
        if (res.exito) {
          this.mensajesChat = res.mensajes;
          setTimeout(() => {
            const chatContainer = document.querySelector('.overflow-y-auto');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
        }
      },
      error: (err) => {
        console.error('Error cargando mensajes:', err);
      }
    });
  }


  enviarMensaje(): void {
    if (!this.usuario || !this.amigoSeleccionadoId || !this.mensajeActual.trim()) {
      return;
    }

    this.socialService.enviarMensaje(
      this.usuario.usuarioid,
      this.amigoSeleccionadoId,
      this.mensajeActual
    ).subscribe({
      next: (res) => {
        if (res.exito) {
          this.mensajeActual = '';
          this.cargarMensajes();
        }
      },
      error: (err) => {
        console.error('Error enviando mensaje:', err);
        this.errorMsg = 'Error al enviar mensaje';
      }
    });
  }

  obtenerNombreChat(): string {
    return this.amigoSeleccionadoNombre || 'Mensajes';
  }

  eliminarAmigo(amigo: Amigo): void {
    if (!this.usuario || !confirm(`¿Deseas eliminar a ${amigo.nombre} de tu lista de amigos?`)) {
      return;
    }

    this.socialService.eliminarAmigo(amigo.id, this.usuario.usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.amigos = this.amigos.filter(a => a.id !== amigo.id);
          if (this.amigoSeleccionadoId === amigo.id) {
            this.amigoSeleccionadoId = null;
            this.mensajesChat = [];
          }
          this.successMsg = 'Amigo eliminado';
        }
      },
      error: (err) => {
        console.error('Error eliminando amigo:', err);
      }
    });
  }

  aceptarSolicitud(solicitud: any): void {
    if (!this.usuario) return;

    this.socialService.aceptarAmistad(solicitud.amistad_id).subscribe({
      next: (res) => {
        if (res.exito) {
          this.successMsg = `Amistad aceptada con ${solicitud.nombre}`;
          this.solicitudes = this.solicitudes.filter(s => s.amistad_id !== solicitud.amistad_id);
          this.cargarAmigos();
          setTimeout(() => this.successMsg = '', 3000);
        }
      },
      error: (err) => {
        console.error('Error aceptando solicitud:', err);
        this.errorMsg = 'Error al aceptar solicitud';
      }
    });
  }

  rechazarSolicitud(solicitud: any): void {
    if (!this.usuario) return;

    this.socialService.rechazarAmistad(solicitud.amistad_id).subscribe({
      next: (res) => {
        if (res.exito) {
          this.successMsg = `Solicitud rechazada`;
          this.solicitudes = this.solicitudes.filter(s => s.amistad_id !== solicitud.amistad_id);
          setTimeout(() => this.successMsg = '', 3000);
        }
      },
      error: (err) => {
        console.error('Error rechazando solicitud:', err);
        this.errorMsg = 'Error al rechazar solicitud';
      }
    });
  }

  private actualizarEstadoOnline(): void {
    if (!this.usuario) return;

    this.socialService.actualizarEstado(this.usuario.usuarioid, 'online').subscribe({
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }

  private actualizarEstadoOffline(): void {
    if (!this.usuario) return;

    this.socialService.actualizarEstado(this.usuario.usuarioid, 'offline').subscribe({
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }

  esMensajePropio(remitente_id: number): boolean {
    return remitente_id === this.usuario?.usuarioid;
  }
}
