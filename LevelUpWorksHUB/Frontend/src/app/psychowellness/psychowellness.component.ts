import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Article {
  id: number;
  titulo: string;
  resumen: string;
  categoria: 'estres' | 'burnout' | 'ansiedad' | 'autocuidado';
  tiempo_lectura: string;
  contenido: string;
  url_imagen?: string;
  fecha_publicacion?: string;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  tips: string[];
  icon?: string;
  color: string;
}

@Component({
  selector: 'app-psicowellness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psychowellness.component.html',
})
export class PsychowellnessComponent implements OnInit {

  filterCategory: 'all' | Article['categoria'] = 'all';
  selectedArticle: Article | null = null;
  articles: Article[] = [];
  recommendations: Recommendation[] = [
    {
      id: 1,
      title: "Respiración consciente",
      description: "Una técnica rápida para reducir tensión en minutos.",
      tips: [
        "Inhala 4 segundos",
        "Mantén 2 segundos",
        "Exhala 6 segundos",
      ],
      color: "yellow"
    },
    {
      id: 2,
      title: "Organiza tus tareas",
      description: "Ordenar tus actividades reduce el estrés y aumenta tu control.",
      tips: [
        "Haz una lista simple",
        "Prioriza lo urgente",
        "Evita multitareas",
      ],
      color: "blue"
    }
  ];

  staticArticles: Article[] = [
    {
      id: 0,
      titulo: 'Respira y relájate',
      resumen: 'Prueba técnicas de respiración para relajarte.',
      categoria: 'estres',
      tiempo_lectura: '2 min',
      contenido: 'Contenido de ejemplo para relajarse.'
    },
    {
      id: 1,
      titulo: 'Pequeños descansos',
      resumen: 'Tomar pausas cortas mejora tu productividad.',
      categoria: 'autocuidado',
      tiempo_lectura: '3 min',
      contenido: 'Contenido de ejemplo sobre autocuidado.'
    },
    {
      id: 2,
      titulo: 'Mindfulness diario',
      resumen: 'Dedica 5 minutos al día a meditar.',
      categoria: 'ansiedad',
      tiempo_lectura: '4 min',
      contenido: 'Contenido de ejemplo sobre mindfulness.'
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadArticles();
  }


  loadArticles() {
    this.http.get<Article[]>('http://localhost:5000/psycho/articulos')
      .subscribe({
        next: (data: any) => {
          const payload = Array.isArray(data) ? data : (data?.articulos ?? []);
          this.articles = payload.map((a: any, idx: number) => ({
            id: a.id_articulo ?? a.id ?? idx + 1000,
            titulo: a.titulo ?? a.title ?? 'Sin título',
            resumen: a.resumen ?? a.summary ?? '',
            categoria: this.normalizeCategory(a.categoria ?? a.category ?? ''),
            tiempo_lectura: a.tiempo_lectura ?? a.read_time ?? '3 min',
            contenido: a.contenido ?? a.content ?? '',
            url_imagen: a.url_imagen ?? a.image_url ?? a.url_imagen ?? undefined,
            fecha_publicacion: a.fecha_publicacion ?? a.date ?? undefined
          }));
        },
        error: err => {
          console.error('Error cargando artículos:', err);
          this.articles = [];
        }
      });
  }

  normalizeCategory(raw: string): Article['categoria'] {
    if (!raw) return 'estres';
    const c = raw.toString().trim().toLowerCase();
    if (['estres','estrés','stress','stresss'].includes(c)) return 'estres';
    if (['burnout'].includes(c)) return 'burnout';
    if (['ansiedad','anxiety'].includes(c)) return 'ansiedad';
    if (['autocuidado','selfcare','self-care'].includes(c)) return 'autocuidado';
    return 'estres';
  }

  get filteredArticles(): Article[] {
    const all = [...this.staticArticles, ...this.articles];
    if (this.filterCategory === 'all') return all;
    return all.filter(a => a.categoria === this.filterCategory);
  }

  // método para setear filtro desde template (mantener fácil binding)
  setFilter(cat: 'all' | Article['categoria']) {
    this.filterCategory = cat;
  }

  setSelectedArticle(article: Article) {
    this.selectedArticle = article;
  }

  closeArticle() {
    this.selectedArticle = null;
  }

  getCategoryBadgeClasses(category: Article['categoria']): string {
    switch (category) {
      case 'estres': return 'bg-orange-500/20 text-orange-300 border border-orange-600/30';
      case 'burnout': return 'bg-red-500/20 text-red-300 border border-red-600/30';
      case 'ansiedad': return 'bg-blue-500/20 text-blue-300 border border-blue-600/30';
      case 'autocuidado': return 'bg-green-500/20 text-green-300 border border-green-600/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-600/20';
    }
  }

  getCategoryLabel(category: Article['categoria']): string {
    switch (category) {
      case 'estres': return 'Estrés';
      case 'burnout': return 'Burnout';
      case 'ansiedad': return 'Ansiedad';
      case 'autocuidado': return 'Autocuidado';
      default: return 'Categoría';
    }
  }
}
