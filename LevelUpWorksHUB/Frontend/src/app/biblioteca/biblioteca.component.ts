// src/app/biblioteca/biblioteca.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BibliotecaService, JuegoBiblioteca } from '../services/biblioteca.service';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './biblioteca.component.html',
  styles: []})
export class BibliotecaComponent implements OnInit {

  usuario: Usuario | null = null;

  searchTerm: string = '';
  juegos: JuegoBiblioteca[] = [];

  cargando = false;
  errorMsg = '';

  constructor(
    private bibliotecaSvc: BibliotecaService,
    private authSvc: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.usuario = this.authSvc.obtenerUsuario();

    if (!this.usuario) {
      console.warn('No hay usuario logueado, no se puede cargar biblioteca');
      this.errorMsg = 'Debes iniciar sesión para ver tu biblioteca.';
      return;
    }

    const usuarioid = this.usuario.usuarioid;
    this.cargarBiblioteca(usuarioid);
  }

  private cargarBiblioteca(usuarioid: number): void {
    this.cargando = true;
    this.errorMsg = '';

    this.bibliotecaSvc.obtenerBiblioteca(usuarioid).subscribe({
      next: (res) => {
        if (res.exito) {
          this.juegos = res.juegos;
          console.log('Juegos en biblioteca:', this.juegos);
        } else {
          this.errorMsg = 'No se pudo cargar la biblioteca.';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error HTTP al cargar biblioteca:', err);
        this.errorMsg = 'Error en el servidor al cargar la biblioteca.';
        this.cargando = false;
      }
    });
  }

  juegosFiltrados(): JuegoBiblioteca[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.juegos;
    return this.juegos.filter(j =>
      (j.titulo || j.comprasID?.toString() || '').toString().toLowerCase().includes(term)
    );
  }

  descargar(juego: JuegoBiblioteca) {
    console.log('Descargando juego (blob):', juego);
    const baseUrl = 'http://127.0.0.1:5000';
    const url = `${baseUrl}/api/juego/descargar/${juego.juegoID}`;
    this.http.get(url, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const contentType = blob.type || '';
        if (contentType.includes('application/json')) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const txt = reader.result as string;
              const json = JSON.parse(txt);
              alert(json.mensaje || 'Error al obtener el archivo');
            } catch (e) {
              alert('Error desconocido al obtener archivo');
            }
          };
          reader.readAsText(blob);
          return;
        }
        let filename = juego.titulo || 'juego';
        const cd = response.headers.get('content-disposition');
        if (cd) {
          const match = /filename\*=UTF-8''(.+)$/.exec(cd) || /filename="?([^";]+)"?/.exec(cd);
          if (match && match[1]) filename = decodeURIComponent(match[1]);
        }
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        alert('Descarga iniciada.');
      },
      error: (err) => {
        console.error('Error descargando blob:', err);
        alert('Error al descargar el juego');
      }
    });
  }

  jugar(juego: JuegoBiblioteca) {
    console.log('Reproduciendo juego:', juego);
        const baseUrl = 'http://127.0.0.1:5000';
    const url = `${baseUrl}/api/juego/jugar/${juego.juegoID}`;
    
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.exito) {
          alert(`✅ ${res.mensaje}\n\nTipo: ${res.tipo}\n\nEl juego debería estar ejecutándose...`);
        } else {
          alert(`❌ Error: ${res.mensaje}`);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('❌ Error al ejecutar el juego. Verifica la consola.');
      }
    });
  }
}
