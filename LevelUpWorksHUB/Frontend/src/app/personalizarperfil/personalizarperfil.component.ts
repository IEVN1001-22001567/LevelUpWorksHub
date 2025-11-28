import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ActiveTab = 'info' | 'orders' | 'wishlist' | 'payment' | 'addresses' | 'settings';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gamerTag: string;
  country: string;
  city: string;
  favoriteGenre: string;
  bio: string;
  avatar: string;
}

interface Order {
  id: number;
  game: string;
  date: string;
  price: string;
  status: string;
}

interface WishlistItem {
  id: number;
  game: string;
  releaseDate: string;
  price: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  expiry: string;
}

interface Address {
  id: number;
  type: string;
  street: string;
  city: string;
  postal: string;
}

@Component({
  selector: 'app-personalizarperfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personalizarperfil.component.html'
})
export class PersonalizarperfilComponent {
  isEditing = false;
  isAdmin = true; // puedes conectarlo a tu lógica real
  activeTab: ActiveTab = 'info';

  user = {
    totalPurchases: 12,
    memberSince: '2023'
  };

  // Datos originales (para cancelar edición)
  private originalProfileData: ProfileData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+52 55 1234 5678',
    birthdate: '1995-06-15',
    gamerTag: 'JuanitoOP',
    country: 'México',
    city: 'CDMX',
    favoriteGenre: 'RPG / Acción',
    bio: 'Gamer de corazón, fan de los RPG y los indies.',
    avatar: 'https://via.placeholder.com/150'
  };

  profileData: ProfileData = structuredClone(this.originalProfileData);

  // Listas fake de ejemplo (conéctalas después a tu backend)
  orders: Order[] = [
    { id: 1234, game: 'Elden Ring', date: '2024-01-02', price: '$59.99', status: 'Completado' },
    { id: 1235, game: 'Hollow Knight', date: '2024-02-10', price: '$14.99', status: 'Completado' }
  ];

  wishlist: WishlistItem[] = [
    { id: 1, game: 'Silksong', releaseDate: 'Próximamente', price: '$39.99' },
    { id: 2, game: 'GTA VI', releaseDate: '2025', price: '$69.99' }
  ];

  paymentMethods: PaymentMethod[] = [
    { id: 1, type: 'Visa', last4: '1234', expiry: '12/27' },
    { id: 2, type: 'Mastercard', last4: '5678', expiry: '08/26' }
  ];

  addresses: Address[] = [
    { id: 1, type: 'Casa', street: 'Calle Falsa 123', city: 'CDMX', postal: '01234' },
    { id: 2, type: 'Oficina', street: 'Av. Reforma 456', city: 'CDMX', postal: '06700' }
  ];

  get avatarInitial(): string {
    return this.profileData.name ? this.profileData.name.charAt(0).toUpperCase() : '?';
  }

  setActiveTab(tab: ActiveTab) {
    this.activeTab = tab;
  }

  startEditing() {
    this.isEditing = true;
    this.originalProfileData = structuredClone(this.profileData);
  }

  handleSaveProfile() {
    this.isEditing = false;
    // Aquí llamarías a tu servicio para guardar en el backend
    console.log('Perfil guardado', this.profileData);
  }

  handleCancelEdit() {
    this.isEditing = false;
    this.profileData = structuredClone(this.originalProfileData);
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileData.avatar = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePaymentMethod(id: number) {
    this.paymentMethods = this.paymentMethods.filter(m => m.id !== id);
  }

  removeAddress(id: number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
  }
}
