import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-soportetec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soportetec.component.html',
  styleUrls: ['./soportetec.component.css']
})
export class SoporteTecComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthService) {}

  // -------------------- datos visuales --------------------
metodosContacto = [
  { titulo: 'Chat en Vivo', descripcion: 'Habla con un agente', disponibilidad: '24/7', accion: 'Abrir Chat', emoji: '💬' },
  { titulo: 'Correo Electrónico', descripcion: 'Responderemos pronto', disponibilidad: 'Tiempo estimado: 1-3 h', accion: 'Enviar Correo', emoji: '📧' },
  { titulo: 'Llamada Telefónica', descripcion: 'Atención personalizada', disponibilidad: 'L-V 9AM–6PM', accion: 'Llamar', emoji: '📞' }
];

enlacesRapidos = [
  { titulo: 'Reportar un Error', descripcion: 'Informa fallos o bugs', emoji: '⚠️' },
  { titulo: 'Guías y Manuales', descripcion: 'Documentación del sistema', emoji: '📘' },
  { titulo: 'Preguntas Frecuentes', descripcion: 'Encuentra respuestas', emoji: '❓' }
];


  faq = [
    { categoria: 'Cuenta y Acceso', preguntas: [
        { pregunta: '¿Cómo recupero acceso a mi cuenta?', respuesta: 'Puedes restablecer tu contraseña desde el correo vinculado.' },
        { pregunta: '¿Puedo cambiar mi correo?', respuesta: 'Sí, desde la sección de ajustes de tu perfil.' }
    ]},
    { categoria: 'Compras y Pagos', preguntas: [
        { pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Aceptamos tarjetas, PayPal y pagos locales dependiendo del país.' },
        { pregunta: '¿Puedo pedir un reembolso?', respuesta: 'Sí, dentro de los primeros 14 días si no pasaste 2 horas de juego.' }
    ]},
  ];

  // -------------------- Datos usuario --------------------
  correoUsuario: string = '';

  ngOnInit() {
    const usuario: Usuario | null = this.authService.obtenerUsuario();
    if (usuario) this.correoUsuario = usuario.email;
  }

  // -------------------- Modal --------------------
  modalAbierto = false;
  modalContenido = "";

  abrirModal(nombre: string) {
    this.modalContenido = nombre;
    this.modalAbierto = true;

    if (nombre === 'Consultar Tickets') {
      if (!this.correoUsuario) return alert("Debes iniciar sesión para consultar tus tickets");

      // Trae solo los tickets del usuario loggeado
      this.http.get<any[]>(`http://127.0.0.1:5000/soporte/tickets?correo=${this.correoUsuario}`)
        .subscribe({
          next: data => this.tickets = data,
          error: () => alert("Error al cargar tickets")
        });
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  // -------------------- Crear Ticket --------------------
  formTicket = {
    asunto: "",
    descripcion: ""
  };

  enviarTicket() {
    if (!this.correoUsuario) return alert("Debes iniciar sesión para enviar un ticket");

    const ticket = {
      correo: this.correoUsuario,
      asunto: this.formTicket.asunto,
      descripcion: this.formTicket.descripcion
    };

    this.http.post('http://127.0.0.1:5000/soporte/tickets', ticket)
      .subscribe({
        next: () => {
          alert("Ticket enviado correctamente");
          this.formTicket = { asunto: "", descripcion: "" };
          this.cerrarModal();
        },
        error: () => alert("Error al enviar ticket")
      });
  }

  // -------------------- Consultar Tickets --------------------
  tickets: any[] = [];

}
