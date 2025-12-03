import { Component } from '@angular/core';
import { TitleCasePipe, NgFor, NgIf } from '@angular/common';

interface GameUpdate {
  id: string;
  game: string;
  title: string;
  version: string;
  date: string;
  type: 'patch' | 'content' | 'event' | 'hotfix';
  description: string;
  changes: string[];
  size: string;
}
@Component({
  selector: 'app-actualizaciones',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    TitleCasePipe
  ],
  templateUrl: './actualizaciones.component.html'
})

export class ActualizacionesComponent {

  updates: GameUpdate[] = [
    {
      id: '1',
      game: 'Chainsaw of the Dead',
      title: 'Actualización: Arsenal Expandido',
      version: 'v1.5.0',
      date: '2025-11-07',
      type: 'content',
      description: 'Nueva expansión con armas mejoradas, habilidades de personaje y zona de supervivencia.',
      changes: [
        'Nueva motosierra legendaria: "La Trituradora"',
        '5 nuevas habilidades de combate RPG',
        'Zona expandida: Hospital Abandonado',
        'Sistema de crafteo de armas mejorado',
        'Nuevos tipos de zombies: Infectados rápidos',
        'Ajustes de balance en dificultad'
      ],
      size: '3.2 GB'
    },
    {
      id: '2',
      game: 'Wyvern Quest',
      title: 'Expansión: Reinos Olvidados',
      version: 'v2.0.0',
      date: '2025-11-06',
      type: 'content',
      description: 'Enorme expansión con nueva región, misiones épicas y sistema de montura de dragones.',
      changes: [
        'Nueva región: Las Tierras Olvidadas (20+ horas)',
        'Sistema de doma y vuelo de dragones',
        '15 misiones principales y 30 secundarias',
        'Nueva clase jugable: Caballero Dracónico',
        'Mazmorras desafiantes con jefes legendarios',
        'Sistema de encantamiento de armas'
      ],
      size: '6.8 GB'
    },
    {
      id: '3',
      game: 'Burnout',
      title: 'Actualización VR: Pesadillas Mejoradas',
      version: 'v1.3.0',
      date: '2025-11-05',
      type: 'content',
      description: 'Mejoras en experiencia VR, nuevos escenarios de terror y optimización de rendimiento.',
      changes: [
        'Soporte mejorado para Meta Quest 3 y PSVR2',
        'Nuevo nivel: Asilo Embrujado',
        'Sistema de audio espacial 3D mejorado',
        'Nuevos eventos de terror procedurales',
        'Optimización para reducir mareos en VR',
        'Controles hápticos más inmersivos'
      ],
      size: '2.5 GB'
    },
    {
      id: '4',
      game: 'Chainsaw of the Dead',
      title: 'Parche de Optimización',
      version: 'v1.4.8',
      date: '2025-11-04',
      type: 'patch',
      description: 'Mejoras de rendimiento y correcciones en Unity.',
      changes: [
        'Optimización del motor Unity (+20 FPS)',
        'Corregido bug en sistema de inventario',
        'Ajustada IA de zombies para mayor desafío',
        'Mejorada estabilidad general del juego',
        'Reducidos tiempos de carga entre niveles'
      ],
      size: '780 MB'
    },
    {
      id: '5',
      game: 'Wyvern Quest',
      title: 'Hotfix: Correcciones Críticas',
      version: 'v1.9.2',
      date: '2025-11-03',
      type: 'hotfix',
      description: 'Corrección urgente de errores en misiones principales.',
      changes: [
        'Resuelto bug que impedía completar misión "El Rey Dragón"',
        'Corregido crash durante cinemáticas',
        'Ajustado balance de jefe final',
        'Mejorada sincronización en co-op'
      ],
      size: '420 MB'
    },
    {
      id: '6',
      game: 'Burnout',
      title: 'Evento: Noche de Terror',
      version: 'v1.2.5',
      date: '2025-11-01',
      type: 'event',
      description: 'Evento especial con nuevos sustos y desafíos en VR.',
      changes: [
        'Modo de juego temporal: Supervivencia Extrema',
        'Nuevos enemigos espectrales',
        'Desafíos diarios con recompensas',
        'Logros exclusivos del evento',
        'Efectos de sonido mejorados para VR'
      ],
      size: '1.2 GB'
    }
  ];

  selectedTab = 'all';

  filterUpdates() {
    if (this.selectedTab === 'all') return this.updates;
    return this.updates.filter(u => u.type === this.selectedTab);
  }

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
