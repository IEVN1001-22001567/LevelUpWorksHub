import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
  import { EventosService } from '../../services/eventos.service';


@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admineventos.component.html',
})
export class AdminEventosComponent implements OnInit {

  mostrarFormulario = false;
  editando = false;
  imagenPreview: string | null = null;

  noticias: any[] = [];

  noticiaForm: any = {
    even_actu_id: null,
    titulo: '',
    tipo: '',
    fecha: '',
    autor: '',
    descripcion: '',
    imagen: '',
    destacado: 0,
    estado: 'activo'
  };

  constructor(private eventosService: EventosService) {}

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.eventosService.obtenerEventos().subscribe((data: any[]) => {
      this.noticias = data;
    });
  }

  nuevaNoticia() {
    this.editando = false;
    this.mostrarFormulario = true;
    this.imagenPreview = null;

    this.noticiaForm = {
      even_actu_id: null,
      titulo: '',
      tipo: '',
      fecha: '',
      autor: '',
      descripcion: '',
      imagen: '',
      destacado: 0,
      estado: 'activo'
    };
  }

  editarNoticia(ev: any) {
  this.editando = true;
  this.mostrarFormulario = true;

  this.noticiaForm = { ...ev };

 this.imagenPreview = ev.imagen ? `data:image/png;base64,${ev.imagen}` : null;

  delete this.noticiaForm.imagenFile;
}

  onImagenSeleccionada(event: any) {
  const archivo = event.target.files[0];
  if (!archivo) return;
  this.noticiaForm.imagenFile = archivo;
  const reader = new FileReader();
  reader.onload = () => {
  this.imagenPreview = reader.result as string;
};
  reader.readAsDataURL(archivo);
}


guardarNoticia() {
  this.noticiaForm.destacado = Number(this.noticiaForm.destacado);
  console.log('Enviando evento:', this.noticiaForm);

  if (this.editando) {
    const id = this.noticiaForm.even_actu_id;
    this.eventosService.actualizarEvento(id, this.noticiaForm).subscribe({
      next: (res) => {
        console.log('Evento actualizado:', res);
        this.cargarEventos();
        this.cerrarFormulario();
      },
      error: (err) => {
        console.error('Error al actualizar evento:', err);
        alert('Error al actualizar evento. Revisa la consola.');
      }
    });
  } else {
    this.eventosService.crearEvento(this.noticiaForm).subscribe({
      next: (res) => {
        console.log('Evento creado:', res);
        this.cargarEventos();
        this.cerrarFormulario();
      },
      error: (err) => {
        console.error('Error al crear evento:', err);
        alert('Error al crear evento. Revisa la consola.');
      }
    });
  }
}


  eliminarNoticia(id: number) {
    this.eventosService.eliminarEvento(id).subscribe(() => {
      this.cargarEventos();
    });
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }
}
