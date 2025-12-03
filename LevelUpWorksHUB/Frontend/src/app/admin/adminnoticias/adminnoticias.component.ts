import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminnoticias.component.html',
  styleUrls: ['./adminnoticias.component.css']
})
export class AdminNoticiasComponent implements OnInit {

  private apiUrl = 'http://127.0.0.1:5000/noticias';

  mostrarFormulario = false;
  editando = false;
  imagenPreview: string | null = null;

  noticias: any[] = [];

  noticiaForm: any = {
    noticiaid: null,
    titulo: '',
    tipo: '',
    fecha: '',
    autor: '',
    descripcion: '',
    imagen: ''
  };

  constructor(private http: HttpClient) {}

  //Cargar noticias desde la base de datos al iniciar
  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.noticias = data,
      error: (err) => console.error("Error al cargar noticias:", err)
    });
  }

  nuevaNoticia() {
    this.editando = false;
    this.mostrarFormulario = true;
    this.imagenPreview = null;

    this.noticiaForm = {
      id: null,
      titulo: '',
      tipo: '',
      fecha: '',
      autor: '',
      descripcion: '',
      imagen: ''
    };
  }

  editarNoticia(noticia: any) {
  this.editando = true;
  this.mostrarFormulario = true;

  this.noticiaForm = { ...noticia };
  this.imagenPreview = noticia.imagen || null;
}

  //Convertir imagen local a BASE64
  onImagenSeleccionada(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagenPreview = reader.result as string;
      this.noticiaForm.imagen = reader.result;
    };

    reader.readAsDataURL(archivo);
  }

  //Guardar en base de datos
  guardarNoticia() {
    if (this.editando) {
      // --- PUT actualizar ---
      this.http.put(`${this.apiUrl}/${this.noticiaForm.noticiaid}`, this.noticiaForm) .subscribe({
        next: () => {
          this.cargarNoticias();
          this.cerrarFormulario();
        },
        error: (err) => console.error("Error al editar noticia:", err)
      });

    } else {
      //POST crear
      this.http.post(this.apiUrl, this.noticiaForm).subscribe({
        next: () => {
          this.cargarNoticias();
          this.cerrarFormulario();
        },
        error: (err) => console.error("Error al crear noticia:", err)
      });
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  eliminarNoticia(noticiaid: number) {
    if (!confirm("¿Seguro que deseas eliminar esta noticia?")) return;

    this.http.delete(`${this.apiUrl}/${noticiaid}`).subscribe({
      next: () => this.cargarNoticias(),
      error: (err) => console.error("Error al eliminar noticia:", err)
    });
  }
}
