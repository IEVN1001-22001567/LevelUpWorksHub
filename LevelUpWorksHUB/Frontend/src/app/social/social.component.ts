import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <- IMPORTANTE

@Component({
  standalone: true,
  selector: 'app-social',
  templateUrl: './social.component.html',
  imports: [
    CommonModule,
    FormsModule // <- AGREGA ESTO
  ]
})
export class SocialComponent {

  amigos = [
    { id: '1', nombre: 'PlayerOne', estado: 'online', juego: 'Jugando Chainsaw of the Dead' },
    { id: '2', nombre: 'GamerDude', estado: 'online', juego: 'En Tienda' },
    { id: '3', nombre: 'ProGamer99', estado: 'offline', juego: 'Desconectado' },
    { id: '4', nombre: 'NightHawk', estado: 'online', juego: 'Jugando Wyvern Quest' }
  ];

  amigoSeleccionadoId: string | null = null;
  mensajesChat: Array<{ id: string, remitente: string, texto: string }> = [];
  mensajeActual: string = '';

  obtenerNombreChat(): string {
    if (!this.amigoSeleccionadoId) return 'Mensajes';
    const amigo = this.amigos.find(a => a.id === this.amigoSeleccionadoId);
    return amigo ? `Chat con ${amigo.nombre}` : 'Mensajes';
  }

  seleccionarAmigo(id: string) {
    this.amigoSeleccionadoId = id;

    const amigo = this.amigos.find(a => a.id === id);

    this.mensajesChat = [
      { id: '1', remitente: amigo?.nombre || '', texto: '¡Hola! ¿Cómo estás?' },
      { id: '2', remitente: 'Tú', texto: '¡Todo bien! ¿Jugamos?' }
    ];
  }

  enviarMensaje() {
    if (!this.mensajeActual.trim() || !this.amigoSeleccionadoId) return;

    this.mensajesChat.push({
      id: Date.now().toString(),
      remitente: 'Tú',
      texto: this.mensajeActual
    });

    this.mensajeActual = '';
  }
}
