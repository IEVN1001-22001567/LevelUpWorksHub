import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-soportetec',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soportetec.component.html',
  styleUrls: ['./soportetec.component.css']
})
export class SoporteTecComponent {

  metodosContacto = [
    {
      icono: 'assets/iconos/chat.svg',
      titulo: 'Chat en Vivo',
      descripcion: 'Respuesta inmediata',
      disponibilidad: 'Disponible ahora',
      accion: 'Iniciar Chat'
    },
    {
      icono: 'assets/iconos/correo.svg',
      titulo: 'Email',
      descripcion: 'Respuesta en 24h',
      disponibilidad: 'support@leveluphub.com',
      accion: 'Enviar Email'
    },
    {
      icono: 'assets/iconos/telefono.svg',
      titulo: 'Teléfono',
      descripcion: 'Soporte telefónico',
      disponibilidad: 'Lun-Vie 9am-6pm',
      accion: 'Ver Número'
    }
  ];

  enlacesRapidos = [
    { icono: 'assets/iconos/documento.svg', titulo: 'Documentación', descripcion: 'Guías y tutoriales completos' },
    { icono: 'assets/iconos/rayo.svg', titulo: 'Estado del Servidor', descripcion: 'Verifica el estado actual' },
    { icono: 'assets/iconos/reloj.svg', titulo: 'Historial de Tickets', descripcion: 'Revisa tus consultas pasadas' }
  ];

  faq = [
    {
      categoria: 'Cuenta y Compras',
      preguntas: [
        {
          pregunta: '¿Cómo recupero mi contraseña?',
          respuesta: 'Haz clic en "Olvidé mi contraseña" y recibirás instrucciones vía correo electrónico.'
        },
        {
          pregunta: '¿Cómo puedo devolver un juego?',
          respuesta: 'Puedes solicitar un reembolso dentro de 48 horas siempre que no hayas jugado más de 2 horas.'
        },
        {
          pregunta: '¿Puedo regalar un juego?',
          respuesta: 'Sí, cada juego incluye un botón de “Regalar” para enviar a otro usuario.'
        }
      ]
    },
    {
      categoria: 'Problemas Técnicos',
      preguntas: [
        {
          pregunta: 'El juego no inicia o se cierra solo',
          respuesta: 'Actualiza tus drivers, revisa requisitos mínimos e instala la última versión del juego.'
        },
        {
          pregunta: '¿El juego no descarga?',
          respuesta: 'Revisa tu conexión y asegúrate de tener suficiente espacio en disco.'
        },
        {
          pregunta: 'Problemas con VR en Burnout',
          respuesta: 'Confirma que tu visor está configurado correctamente y que SteamVR esté actualizado.'
        }
      ]
    }
  ];
}
