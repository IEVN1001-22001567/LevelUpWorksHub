import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {

  private apiUrl = 'http://127.0.0.1:5000/noticias';

  categorias = ['Todas', 'Actualización', 'Logro', 'Premios', 'Desarrollo', 'Anuncio'];

  noticias: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.noticias = data;
      },
      error: (err) => console.error("Error al cargar noticias:", err)
    });
  }

  get articuloDestacado() {
    return this.noticias.find(n => n.featured);
  }

  get articulosNormales() {
    return this.noticias.filter(n => !n.featured);
  }
}