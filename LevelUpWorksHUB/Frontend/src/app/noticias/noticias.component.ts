import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {

  private apiUrl = 'http://127.0.0.1:5000/noticias';
  categorias = ['Todas', 'Actualización', 'Logro', 'Premios', 'Desarrollo', 'Anuncio'];

  noticias: any[] = [];
  correoNewsletter: string = ''; 
  articuloSeleccionado: any = null;
  modalVisible: boolean = false;

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

  suscribirse() {
    const correo = this.correoNewsletter.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo || !emailRegex.test(correo)) {
      alert("Ingresa un correo válido");
      return;
    }

    this.http.post('http://127.0.0.1:5000/newsletter', { correo })
      .subscribe({
        next: (res: any) => {
          alert(res.mensaje);
          this.correoNewsletter = ''; 
        },
        error: (err) => {
          console.error(err);
          alert('Error al registrarte. Intenta de nuevo.');
        }
      });
  }

  abrirModal(articulo: any) {
    this.articuloSeleccionado = articulo;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.articuloSeleccionado = null;
  }

}
