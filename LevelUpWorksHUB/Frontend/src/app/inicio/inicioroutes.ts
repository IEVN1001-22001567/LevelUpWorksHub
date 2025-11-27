import { Routes } from "@angular/router";

export default [
  {
    path: '',
    loadComponent: () => import('./inicio.component')
  }
] as Routes;
