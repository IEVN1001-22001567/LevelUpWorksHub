// src/app/carrito/carrito.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService, ItemCarrito } from '../services/carrito.service';
import { AuthService, Usuario } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {

  items: ItemCarrito[] = [];
  subtotal = 0;
  iva = 0;
  total = 0;

  usuario: Usuario | null = null;
  isLoggedIn = false;

  private subs: Subscription[] = [];

  constructor(
    private carritoSvc: CarritoService,
    private authSvc: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sub1 = this.carritoSvc.items$.subscribe(items => {
      this.items = items;
      this.recalcularTotales();
    });

    const sub2 = this.authSvc.user$.subscribe(user => {
      this.usuario = user;
      this.isLoggedIn = !!user;
    });

    this.subs.push(sub1, sub2);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private recalcularTotales() {
    this.subtotal = this.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  vaciar() {
    this.carritoSvc.vaciarCarrito();
  }

  decrementar(item: ItemCarrito) {
    if (item.cantidad > 1) {
      this.carritoSvc.actualizarCantidad(item.id, item.cantidad - 1);
    }
  }

  incrementar(item: ItemCarrito) {
    this.carritoSvc.actualizarCantidad(item.id, item.cantidad + 1);
  }

  eliminar(item: ItemCarrito) {
    this.carritoSvc.eliminarItem(item.id);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  procederPago() {
    if (!this.isLoggedIn || !this.usuario) {
      this.irALogin();
      return;
    }

    if (this.items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    this.carritoSvc.procesarPago(this.usuario.usuarioid).subscribe({
      next: (res) => {
        console.log('Respuesta de procesarPago:', res);

        if (res.exito) {
          alert('Pago realizado correctamente');

          if (typeof res.nuevo_saldo === 'number') {
            this.usuario = { ...this.usuario!, saldo: res.nuevo_saldo };
            this.authSvc.guardarUsuario(this.usuario);
          }

          this.carritoSvc.vaciarCarrito();

          this.router.navigate(['/biblioteca']);
        } else {
          alert(res.mensaje || 'Error al procesar el pago');
        }
      },
      error: (err) => {
        console.error('Error al procesar pago:', err);
        alert('Error en el servidor al procesar el pago');
      }
    });
  }
}
