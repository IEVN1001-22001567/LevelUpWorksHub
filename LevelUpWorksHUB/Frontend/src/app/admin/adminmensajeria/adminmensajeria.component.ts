import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para la pestaña de configuración

@Component({
  selector: 'app-admin-mensajeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminmensajeria.component.html',
  styles: []
})
export class AdminMensajeriaComponent {

  // Pestaña activa por defecto
  activeTab: 'usuarios' | 'mensajes' | 'reportes' | 'configuracion' = 'usuarios';

  // Datos simulados - USUARIOS
  usuarios = [
    { id: 1, nombre: 'PlayerOne', estado: 'En línea', mensajes: 145, reportes: 0, baneado: false },
    { id: 2, nombre: 'GamerDude', estado: 'En línea', mensajes: 89, reportes: 1, baneado: false },
    { id: 3, nombre: 'ProGamer99', estado: 'Desconectado', mensajes: 234, reportes: 0, baneado: false },
    { id: 4, nombre: 'NightHawk', estado: 'En línea', mensajes: 67, reportes: 0, baneado: false },
    { id: 5, nombre: 'ToxicPlayer', estado: 'Baneado', mensajes: 12, reportes: 5, baneado: true }
  ];

  // Datos simulados - MENSAJES
  mensajesRecientes = [
    { id: 1, de: 'PlayerOne', para: 'GamerDude', fecha: '2025-11-25 10:30', contenido: '¿Jugamos esta noche?', reportado: false },
    { id: 2, de: 'ToxicPlayer', para: 'ProGamer99', fecha: '2025-11-25 09:15', contenido: 'Contenido inapropiado reportado', reportado: true },
    { id: 3, de: 'GamerDude', para: 'NightHawk', fecha: '2025-11-25 08:45', contenido: 'Ya vi la nueva actualización', reportado: false }
  ];

  // Datos simulados - REPORTES
  reportes = [
    { id: 1, usuario: 'ToxicPlayer', reportadoPor: 'ProGamer99', motivo: 'Lenguaje ofensivo y acoso', estado: 'PENDIENTE' },
    { id: 2, usuario: 'GamerDude', reportadoPor: 'PlayerOne', motivo: 'Spam de mensajes', estado: 'DESESTIMADO' }
  ];

  // Datos simulados - CONFIGURACIÓN
  config = {
    limiteMensajes: 50,
    longitudMaxima: 500,
    palabrasProhibidas: '',
    moderacionAutomatica: true,
    notificarEquipo: true
  };

  // Función para cambiar de pestaña
  setTab(tab: 'usuarios' | 'mensajes' | 'reportes' | 'configuracion') {
    this.activeTab = tab;
  }

  // Acciones simuladas
  banearUsuario(id: number) {
    alert('Usuario baneado/desbaneado correctamente.');
  }

  eliminar(id: number, tipo: string) {
    if(confirm(`¿Eliminar este ${tipo}?`)) {
      alert('Elemento eliminado.');
    }
  }
}
