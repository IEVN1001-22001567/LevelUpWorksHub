import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: 'estres' | 'burnout' | 'ansiedad' | 'autocuidado';
  readTime: string;
  content: string;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  tips: string[];
  icon?: string; // optional string to pick an inline SVG or classname
  color: string;
}

@Component({
  selector: 'app-psicowellness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psychowellness.component.html',
  // if you want local css file, add styleUrls; Tailwind handles most
})
export class PsicowellnessComponent {

  // UI state
  filterCategory: 'all' | Article['category'] = 'all';
  selectedArticle: Article | null = null;

  // Data (from your Figma/React)
  articles: Article[] = [
    {
      id: 1,
      title: "¿Qué es el Burnout y cómo identificarlo?",
      excerpt: "El síndrome de burnout es un estado de agotamiento físico, emocional y mental...",
      category: "burnout",
      readTime: "5 min",
      content: "El burnout no es solo cansancio. Es un estado de agotamiento crónico que afecta tu capacidad para funcionar. Señales clave: fatiga constante, cinismo hacia el trabajo, disminución del rendimiento, irritabilidad, problemas de concentración y sensación de ineficacia."
    },
    {
      id: 2,
      title: "Manejo del Estrés en el Trabajo",
      excerpt: "Técnicas prácticas para reducir el estrés laboral y mantener un equilibrio saludable.",
      category: "estres",
      readTime: "4 min",
      content: "El estrés laboral es normal, pero debe ser manejable. Establece límites claros, toma descansos regulares, practica técnicas de respiración, organiza tus tareas por prioridad y aprende a decir 'no' cuando sea necesario. La prevención es más efectiva que la recuperación."
    },
    {
      id: 3,
      title: "Ansiedad: Reconocerla y Afrontarla",
      excerpt: "La ansiedad es una respuesta natural, pero puede volverse abrumadora. Aprende a gestionarla.",
      category: "ansiedad",
      readTime: "6 min",
      content: "La ansiedad se manifiesta física y mentalmente. Síntomas: palpitaciones, sudoración, pensamientos acelerados, preocupación excesiva. Técnicas de afrontamiento: ejercicio regular, meditación, respiración profunda, reducción de cafeína, y hablar con profesionales cuando sea necesario."
    },
    {
      id: 4,
      title: "El Autocuidado No Es Egoísmo",
      excerpt: "Cuidar de ti mismo es fundamental para cuidar de otros y ser productivo.",
      category: "autocuidado",
      readTime: "3 min",
      content: "El autocuidado incluye: dormir suficiente, alimentarte bien, hacer ejercicio, mantener conexiones sociales, practicar hobbies, y tomarte tiempo para descansar sin culpa. No es un lujo, es una necesidad para tu salud mental y física."
    },
    {
      id: 5,
      title: "Presión Laboral y Salud Mental",
      excerpt: "Cómo la exigencia constante afecta tu bienestar psicológico y qué hacer al respecto.",
      category: "burnout",
      readTime: "5 min",
      content: "La presión laboral constante puede llevar a problemas serios de salud mental. Identifica tus límites, comunica tus necesidades, busca apoyo en recursos humanos o profesionales, y recuerda: ningún trabajo vale más que tu salud mental."
    },
    {
      id: 6,
      title: "Desconexión Digital para la Salud Mental",
      excerpt: "La importancia de desconectarte del trabajo y las pantallas para recuperar tu energía.",
      category: "autocuidado",
      readTime: "4 min",
      content: "Establece horarios sin pantallas, especialmente antes de dormir. Desactiva notificaciones del trabajo fuera del horario laboral. Dedica tiempo a actividades sin tecnología. La desconexión es esencial para la recuperación mental y emocional."
    }
  ];

  recommendations: Recommendation[] = [
    {
      id: 1,
      title: "Gestión del Estrés",
      description: "Técnicas prácticas para reducir el estrés diario",
      color: "purple",
      tips: [
        "Practica respiración profunda: inhala 4 sec, mantén 4 sec, exhala 4 sec",
        "Identifica tus factores de estrés y abórdalos",
        "Establece rutinas predecibles",
        "Practica mindfulness 5-10 min/día",
        "Escribe un diario para procesar emociones"
      ],
    },
    {
      id: 2,
      title: "Prevención del Burnout",
      description: "Protégete del agotamiento laboral crónico",
      color: "red",
      tips: [
        "Establece límites claros entre trabajo y vida personal",
        "Toma descansos regulares",
        "Aprende a delegar",
        "Reconoce señales tempranas",
        "No respondas mensajes fuera de horario"
      ]
    },
    {
      id: 3,
      title: "Salud del Sueño",
      description: "El descanso adecuado es fundamental para la salud mental",
      color: "blue",
      tips: [
        "Mantén horario de sueño consistente",
        "Crea ambiente oscuro y fresco",
        "Evita pantallas 1 hora antes",
        "Limita cafeína después de las 2 PM",
        "Rutina relajante antes de dormir"
      ]
    },
    {
      id: 4,
      title: "Conexiones Sociales",
      description: "Las relaciones saludables son esenciales para el bienestar",
      color: "green",
      tips: [
        "Mantén contacto con amigos y familia",
        "Únete a comunidades afines",
        "Comparte preocupaciones con confianza",
        "Ofrece y pide apoyo",
        "Limita relaciones tóxicas"
      ]
    },
    {
      id: 5,
      title: "Actividad Física",
      description: "El ejercicio mejora tanto la salud física como mental",
      color: "orange",
      tips: [
        "30 min de ejercicio moderado al día",
        "Camina al aire libre",
        "El ejercicio libera endorfinas",
        "No necesitas gimnasio: baila o haz yoga",
        "La constancia > intensidad"
      ]
    },
    {
      id: 6,
      title: "Pausas Conscientes",
      description: "Pequeños descansos que marcan una gran diferencia",
      color: "yellow",
      tips: [
        "Levántate y muévete cada hora",
        "Regla 20-20-20 para ojos",
        "5 min de pausa mental cada 90 min",
        "Sal a tomar aire fresco",
        "Desconecta en el almuerzo"
      ]
    }
  ];

  // ------------ helpers / getters ------------
  get filteredArticles(): Article[] {
    return this.filterCategory === 'all'
      ? this.articles
      : this.articles.filter(a => a.category === this.filterCategory);
  }

  setSelectedArticle(a: Article) {
    this.selectedArticle = a;
    // optionally lock scroll / add classes
  }

  closeArticle() {
    this.selectedArticle = null;
  }

  getCategoryLabel(c: Article['category']) {
    switch (c) {
      case 'burnout': return 'Burnout';
      case 'estres': return 'Estrés';
      case 'ansiedad': return 'Ansiedad';
      case 'autocuidado': return 'Autocuidado';
    }
  }

  getCategoryBadgeClasses(c: Article['category']) {
    switch (c) {
      case 'burnout': return 'bg-red-500/20 text-red-500';
      case 'estres': return 'bg-orange-500/20 text-orange-500';
      case 'ansiedad': return 'bg-blue-500/20 text-blue-500';
      case 'autocuidado': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-800 text-gray-200';
    }
  }

  getRecommendationTextClass(color: string) {
    const map: Record<string,string> = {
      purple: 'text-purple-500',
      red: 'text-red-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      orange: 'text-orange-500',
      yellow: 'text-yellow-500'
    };
    return map[color] || 'text-yellow-500';
  }

}
