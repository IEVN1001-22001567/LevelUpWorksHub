// src/app/personalizarperfil/personalizarperfil.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, Usuario } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personalizarperfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personalizarperfil.component.html',
  styleUrls: ['./personalizarperfil.component.css']
})
export class PersonalizarperfilComponent implements OnInit {

  user: Usuario | any = null;
  isAdmin = false;
  isEditing = false;
  activeTab: string = 'info';

  profileData: any = {
    avatar: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    gamerTag: ''   // lo usamos solo en el front, mapeando a username
  };

  avatarInitial: string = '';
  selectedAvatarFile?: File | null;

  cargando = false;
  errorMsg = '';
  successMsg = '';

  // Tabs dummy (las dejamos vacías para que no den errores)
  orders: any[] = [];
  wishlist: any[] = [];
  paymentMethods: any[] = [];
  addresses: any[] = [];

  private apiUrl = 'http://127.0.0.1:5000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.obtenerUsuario();
    console.log('Usuario en personalizar perfil:', this.user);

    if (!this.user) {
      return;
    }

    this.isAdmin = this.user.rol === 'admin';

    // Mapeamos campos
    this.profileData.avatar   = this.user.avatar || '';
    this.profileData.name     = this.user.nombre || '';
    this.profileData.email    = this.user.email  || '';
    this.profileData.phone    = this.user.telefono || '';
    this.profileData.bio      = this.user.biografia || '';
    this.profileData.gamerTag = this.user.username || '';

    this.avatarInitial = (this.profileData.name || this.profileData.gamerTag || '?')
      .charAt(0)
      .toUpperCase();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  startEditing() {
    this.isEditing = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  handleCancelEdit() {
    this.isEditing = false;
    this.errorMsg = '';
    this.successMsg = '';

    if (this.user) {
      this.profileData.avatar   = this.user.avatar || '';
      this.profileData.name     = this.user.nombre || '';
      this.profileData.email    = this.user.email  || '';
      this.profileData.phone    = this.user.telefono || '';
      this.profileData.bio      = this.user.biografia || '';
      this.profileData.gamerTag = this.user.username || '';
    }
    this.selectedAvatarFile = null;

    this.avatarInitial = (this.profileData.name || this.profileData.gamerTag || '?')
      .charAt(0)
      .toUpperCase();
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedAvatarFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.profileData.avatar = reader.result as string;
    };
    reader.readAsDataURL(this.selectedAvatarFile);
  }

  handleSaveProfile() {
    if (!this.user) {
      this.errorMsg = 'No hay usuario en sesión';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = new FormData();
    formData.append('usuarioid', this.user.usuarioid.toString());

    // Mapeo DIRECTO a columnas de la BD
    formData.append('username', this.profileData.gamerTag || '');
    formData.append('nombre',   this.profileData.name || '');
    formData.append('telefono', this.profileData.phone || '');
    formData.append('biografia', this.profileData.bio || '');

    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    this.http.post<any>(`${this.apiUrl}/api/actualizar_perfil`, formData)
      .subscribe({
        next: (res) => {
          this.cargando = false;
          console.log('Respuesta actualizar_perfil:', res);

          if (res.exito && res.usuario) {
            this.successMsg = 'Perfil actualizado correctamente';

            this.user = res.usuario;
            this.profileData.avatar   = res.usuario.avatar || '';
            this.profileData.name     = res.usuario.nombre || '';
            this.profileData.email    = res.usuario.email || '';
            this.profileData.phone    = res.usuario.telefono || '';
            this.profileData.bio      = res.usuario.biografia || '';
            this.profileData.gamerTag = res.usuario.username || '';

            this.avatarInitial = (this.profileData.name || this.profileData.gamerTag || '?')
              .charAt(0)
              .toUpperCase();

            // Guardamos usuario actualizado globalmente
            this.authService.guardarUsuario(res.usuario);

            this.isEditing = false;
            this.selectedAvatarFile = null;
          } else {
            this.errorMsg = res.mensaje || 'No se pudo actualizar el perfil';
          }
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error actualizar_perfil:', err);
          this.errorMsg = err.error?.mensaje || 'Error en el servidor al actualizar perfil';
        }
      });
  }
}
