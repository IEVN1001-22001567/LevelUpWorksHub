import { Routes } from '@angular/router';
 
export const routes: Routes = [
/*   {
    path: 'auth',
    loadChildren: () =>
      import('./auth/features/auth.routes').then((m) => m.default),
  }, */
  {
    path: 'utl',
    loadChildren: () =>
      import('./utl/utlroutes').then((m) => m.default),
  },
/*   {
    path: 'formularios',
    loadChildren: () =>
      import('./formularios/formularios.routes').then((m) => m.default),
  }, */
];