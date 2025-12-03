import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adminpsycho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminpsycho.component.html',
  styleUrls: ['./adminpsycho.component.css']
})
export class AdminpsychoComponent implements OnInit {

  articulos: any[] = [];

  modalAbierto = false;
  modalTitulo = "Nuevo Artículo";

  articuloForm = {
    id_articulo: null,
    titulo: "",
    categoria: "",
    resumen: "",
    contenido: "",
    tiempo_lectura: "",
    url_imagen: "",
    fecha_publicacion: ""
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarArticulos();
  }
onImageSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    this.articuloForm.url_imagen = reader.result as string;
  };

  reader.readAsDataURL(file);
}

  cargarArticulos() {
    this.http.get("http://localhost:5000/psycho/articulos")
      .subscribe((data: any) => {
        this.articulos = data.articulos;
      });
  }

  nuevoArticulo() {
    this.modalTitulo = "Nuevo Artículo";
    this.articuloForm = {
      id_articulo: null,
      titulo: "",
      categoria: "",
      resumen: "",
      contenido: "",
      tiempo_lectura: "",
      url_imagen: "",
      fecha_publicacion: ""
    };
    this.modalAbierto = true;
  }

  editarArticulo(art: any) {
    this.modalTitulo = "Editar Artículo";
    this.articuloForm = { ...art };
    this.modalAbierto = true;
  }

  closeModal() {
    this.modalAbierto = false;
  }

  guardarArticulo() {

    if (this.articuloForm.id_articulo) {
      this.http.put(
        `http://localhost:5000/psycho/articulos/${this.articuloForm.id_articulo}`,
        this.articuloForm
      ).subscribe(() => {
        this.cargarArticulos();
      });

    } else {
      this.http.post(
        "http://localhost:5000/psycho/articulos",
        this.articuloForm
      ).subscribe(() => {
        this.cargarArticulos();
      });
    }

    this.modalAbierto = false;
  }

  eliminarArticulo(id: number) {
    this.http.delete(`http://localhost:5000/psycho/articulos/${id}`)
      .subscribe(() => {
        this.cargarArticulos();
      });
  }

}
