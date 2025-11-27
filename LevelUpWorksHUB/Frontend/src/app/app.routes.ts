import { Routes } from '@angular/router';

export const routes: Routes = [
{
  path: 'inicio',
  loadChildren: () => import('./inicio/inicioroutes').then(m => m.default)
},
  {
    path: 'utl',
    loadChildren: () => import('./utl/utlroutes').then((m) => m.default),
  }
];
