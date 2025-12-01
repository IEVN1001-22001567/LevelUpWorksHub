import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Game {
  id: string;
  title: string;
  price: number;
  genre: string;
  description: string;
  image: string;       // URL completa para mostrar en el front
  platform: string;
  publishDate?: string;
  hoursPlayed?: number;
}

@Component({
  selector: 'app-admin-juegos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminjuegos.component.html',
})
export class AdminJuegosComponent implements OnInit {

  baseUrl = 'http://127.0.0.1:5000';

  games: Game[] = [];

  // estados de UI
  isAdding = false;
  editingId: string | null = null;
  cargando = false;

  errorMsg = '';
  successMsg = '';

  // formulario
  formData: {
    title: string;
    price: number;
    genre: string;
    description: string;
    platform: string;
  } = {
    title: '',
    price: 0,
    genre: '',
    description: '',
    platform: '',
  };

  // imagen
  selectedImageFile: File | null = null;
  previewImage: string | null = null;
  // arriba con las otras propiedades
  installerFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarJuegos();
  }

  // ================== CARGAR JUEGOS ==================
  cargarJuegos() {
    this.errorMsg = '';
    this.cargando = true;

    this.http.get<any>(`${this.baseUrl}/admin/juegos`).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.exito && res.juegos) {
          this.games = res.juegos.map((j: any) => ({
            id: String(j.id),
            title: j.title,
            price: Number(j.price ?? 0),
            genre: j.genre,
            description: j.description ?? '',
            platform: j.platform ?? '',
            publishDate: j.publishDate,
            hoursPlayed: j.hoursPlayed ?? 0,
            image: j.image
              ? `${this.baseUrl}/static/portadas/${j.image}`
              : ''
          }));
        } else {
          this.errorMsg = res.mensaje || 'No se pudieron cargar los juegos';
        }
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
        this.cargando = false;
        this.errorMsg = 'Error en el servidor al cargar juegos';
      }
    });
  }

  // ================== AGREGAR ==================
  startAdd() {
    this.isAdding = true;
    this.editingId = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.cargando = false;

    this.formData = {
      title: '',
      price: 0,
      genre: '',
      description: '',
      platform: '',
    };
    this.selectedImageFile = null;
    this.previewImage = null;
    this.installerFile = null;

  }

  // ================== SELECCIÓN DE IMAGEN ==================
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImageFile = null;
      this.previewImage = null;
      return;
    }

    const file = input.files[0];
    this.selectedImageFile = file;

    // vista previa
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImage = e.target.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ================== GUARDAR (crear o editar) ==================
  saveGame() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.formData.title || !this.formData.genre || !this.formData.platform) {
      this.errorMsg = 'Título, género y plataforma son obligatorios';
      return;
    }

    // ---- CREAR ----
    if (this.isAdding) {
      const fd = new FormData();
      fd.append('title', this.formData.title);
      fd.append('genre', this.formData.genre);
      fd.append('platform', this.formData.platform);
      fd.append('description', this.formData.description || '');
      fd.append('price', String(this.formData.price ?? 0));

      if (this.selectedImageFile) {
        fd.append('image', this.selectedImageFile);
      }
      if (this.installerFile) {
        fd.append('installer', this.installerFile);
    }


      this.cargando = true;

      this.http.post<any>(`${this.baseUrl}/admin/juegos`, fd).subscribe({
        next: (res) => {
          this.cargando = false;
          if (res.exito && res.juego) {
            const juego = res.juego;

            const nuevoGame: Game = {
              id: String(juego.id),
              title: juego.title,
              price: Number(this.formData.price ?? 0),
              genre: juego.genre,
              description: this.formData.description,
              platform: juego.platform,
              publishDate: juego.publishDate,
              hoursPlayed: juego.hoursPlayed ?? 0,
              image: juego.image
                ? `${this.baseUrl}/static/portadas/${juego.image}`
                : ''
            };

            this.games.unshift(nuevoGame);

            this.successMsg = 'Juego creado correctamente';
            this.isAdding = false;
            this.limpiarFormulario();
          } else {
            this.errorMsg = res.mensaje || 'No se pudo crear el juego';
          }
        },
        error: (err) => {
          console.error('Error creando juego:', err);
          this.cargando = false;
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al crear juego';
        }
      });

      return;
    }

    // ---- EDITAR ----
    if (this.editingId) {
      const fd = new FormData();
      fd.append('title', this.formData.title);
      fd.append('genre', this.formData.genre);
      fd.append('platform', this.formData.platform);
      fd.append('description', this.formData.description || '');
      fd.append('price', String(this.formData.price ?? 0));

      // si el admin seleccionó nueva imagen, la mandamos
      if (this.selectedImageFile) {
        fd.append('image', this.selectedImageFile);
      }

      this.cargando = true;

      this.http.put<any>(`${this.baseUrl}/admin/juegos/${this.editingId}`, fd).subscribe({
        next: (res) => {
          this.cargando = false;
          if (res.exito) {
            // actualizar en el array local
            this.games = this.games.map(g => {
              if (g.id === this.editingId) {
                return {
                  ...g,
                  title: this.formData.title,
                  genre: this.formData.genre,
                  description: this.formData.description,
                  platform: this.formData.platform,
                  price: this.formData.price,
                  // si el backend devuelve nuevo nombre de imagen, idealmente
                  image: this.selectedImageFile && res.juego?.image
                    ? `${this.baseUrl}/static/portadas/${res.juego.image}`
                    : g.image
                };
              }
              return g;
            });

            this.successMsg = 'Juego actualizado correctamente';
            this.editingId = null;
            this.limpiarFormulario();
          } else {
            this.errorMsg = res.mensaje || 'No se pudo actualizar el juego';
          }
        },
        error: (err) => {
          console.error('Error actualizando juego:', err);
          this.cargando = false;
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al actualizar juego';
        }
      });
    }
  }

  // ================== ELIMINAR (API) ==================
  deleteGame(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este juego?')) return;

    this.errorMsg = '';
    this.successMsg = '';

    this.http.delete<any>(`${this.baseUrl}/admin/juegos/${id}`).subscribe({
      next: (res) => {
        if (res.exito) {
          this.games = this.games.filter(g => g.id !== id);
          this.successMsg = 'Juego eliminado correctamente';
        } else {
          this.errorMsg = res.mensaje || 'No se pudo eliminar el juego';
        }
      },
      error: (err) => {
        console.error('Error eliminando juego:', err);
        this.errorMsg = err.error?.mensaje || 'Error en el servidor al eliminar juego';
      }
    });
  }

  // ================== EDITAR (llenar formulario) ==================
  startEdit(game: Game) {
    this.isAdding = false;
    this.editingId = game.id;
    this.errorMsg = '';
    this.successMsg = '';
    this.cargando = false;

    this.formData = {
      title: game.title,
      price: game.price,
      genre: game.genre,
      description: game.description,
      platform: game.platform,
    };

    this.selectedImageFile = null;
    this.previewImage = game.image || null;
  }

  // ================== CANCELAR ==================
  cancel() {
    this.isAdding = false;
    this.editingId = null;
    this.errorMsg = '';
    this.successMsg = '';
    this.cargando = false;
    this.limpiarFormulario();
    this.installerFile = null;


  }

  private limpiarFormulario() {
    this.formData = {
      title: '',
      price: 0,
      genre: '',
      description: '',
      platform: '',
    };
    this.selectedImageFile = null;
    this.previewImage = null;
  }


  onInstallerSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    this.installerFile = null;
    return;
  }

  this.installerFile = input.files[0];
}

}
