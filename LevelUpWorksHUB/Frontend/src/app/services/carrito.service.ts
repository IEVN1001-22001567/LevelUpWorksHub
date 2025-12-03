// src/app/services/carrito.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ItemCarrito {
  id: number;
  titulo: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private baseUrl = 'http://127.0.0.1:5000';

  private itemsSubject = new BehaviorSubject<ItemCarrito[]>(this.cargarDesdeStorage());
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private cargarDesdeStorage(): ItemCarrito[] {
    const raw = localStorage.getItem('carrito');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as ItemCarrito[];
    } catch {
      return [];
    }
  }

  private guardarEnStorage(items: ItemCarrito[]) {
    localStorage.setItem('carrito', JSON.stringify(items));
  }

  private sync(items: ItemCarrito[]) {
    this.guardarEnStorage(items);
    this.itemsSubject.next(items);
  }

  obtenerItemsActuales(): ItemCarrito[] {
    return this.itemsSubject.getValue();
  }

  agregarItem(item: ItemCarrito) {
    const items = this.obtenerItemsActuales();
    const existente = items.find(i => i.id === item.id);

    if (existente) {

      console.warn('Este juego ya está en tu carrito. Solo puedes comprar una copia de cada juego.');
      return false;
    } else {
      this.sync([...items, item]);
      return true;
    }
  }

  actualizarCantidad(id: number, cantidad: number) {
    let items = this.obtenerItemsActuales();
    items = items.map(i =>
      i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i
    );
    this.sync(items);
  }

  eliminarItem(id: number) {
    const items = this.obtenerItemsActuales().filter(i => i.id !== id);
    this.sync(items);
  }

  vaciarCarrito() {
    this.sync([]);
  }

  calcularSubtotal(): number {
    return this.obtenerItemsActuales()
      .reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  procesarPago(usuarioid: number) {
    const items = this.obtenerItemsActuales();
    const total = this.calcularSubtotal();

    const body = {
      usuarioid,
      total,
      items: items.map(item => ({
        juegoID: item.id,
        titulo: item.titulo,
        descripcion: '', 
        precio: item.precio,
        cantidad: item.cantidad
      }))
    };

    console.log('Enviando a /api/carrito/procesar:', body);

    return this.http.post<any>(`${this.baseUrl}/api/carrito/procesar`, body);
  }
}
