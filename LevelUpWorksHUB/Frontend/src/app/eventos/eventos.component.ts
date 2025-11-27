import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent {

  eventosDestacados = [
    {
      id: 1,
      titulo: 'Black Friday Gaming - 70% OFF',
      tipo: 'Promoción',
      fechaInicio: '24 Nov 2025',
      fechaFin: '27 Nov 2025',
      descuento: '70%',
      descripcion: 'La mayor venta del año está aquí. Descuentos masivos en todos nuestros títulos.',
      imagen: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      destacado: true
    }
  ];

  eventosActivos = [
    {
      id: 2,
      titulo: 'Torneo Wyvern Quest: La Conquista del Dragón',
      tipo: 'Evento',
      fechaInicio: '1 Dic 2025',
      fechaFin: '15 Dic 2025',
      premio: '$5,000 USD',
      descripcion: 'Compite contra los mejores jugadores del mundo.',
      imagen: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      participantes: '500+',
      destacado: false
    },
    {
      id: 3,
      titulo: 'Desafío Zombie: Supervivencia Extrema',
      tipo: 'Evento',
      fechaInicio: '20 Nov 2025',
      fechaFin: '30 Nov 2025',
      premio: 'Skins Exclusivas',
      descripcion: 'Sobrevive 100 oleadas en Chainsaw of the Dead.',
      imagen: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      participantes: '1,200+',
      destacado: false
    }
  ];

  eventosProximos = [
    {
      id: 4,
      titulo: 'Burnout VR: Maratón del Terror',
      fecha: '31 Oct 2025',
      hora: '20:00 GMT',
      tipo: 'Evento Comunitario',
      descripcion: 'Stream en vivo de 8 horas con los mejores jugadores.'
    },
    {
      id: 5,
      titulo: 'Pack de Navidad - Bundle Completo',
      fecha: '15 Dic 2025',
      hora: 'Todo el día',
      tipo: 'Promoción Especial',
      descripcion: 'Los 3 juegos + DLCs exclusivos por un precio único.'
    },
    {
      id: 6,
      titulo: 'Actualización Épica: Temporada 2',
      fecha: '1 Ene 2026',
      hora: 'Lanzamiento Global',
      tipo: 'Actualización',
      descripcion: 'Nueva temporada con contenido masivo.'
    }
  ];

  eventosPasados = [
    {
      titulo: 'Summer Sale 2025',
      descripcion: 'Descuentos del 50% en todos los títulos',
      fecha: 'Julio 2025'
    },
    {
      titulo: 'Torneo Wyvern Quest: Primavera',
      descripcion: 'Ganador: DragonSlayer_99 - $3,000 USD',
      fecha: 'Abril 2025'
    },
    {
      titulo: 'Lanzamiento de Burnout VR',
      descripcion: 'Evento con 10,000 jugadores simultáneos',
      fecha: 'Marzo 2025'
    }
  ];
}
