import { Routes } from '@angular/router';

export const routes: Routes = [
{
  path: 'inicio',
  loadChildren: () => import('./inicio/inicioroutes').then(m => m.default)
},
{
  path: '',
  loadChildren: () => import('./inicio/inicioroutes').then(m => m.default)
},
{
  path: 'noticias',
  loadChildren: () => import('./noticias/noticias.routes').then(m => m.NOTICIAS_ROUTES)
},
{
  path: 'psicowellness',
  loadChildren: () =>import('./psycho-wellness/psycho-wellnes.routes').then(m => m.PSICOWELLNESS_ROUTES)
},
{
  path: 'eventos',
  loadChildren: () =>import('./eventos/eventos.routes').then(m => m.EVENTOS_ROUTES)
},
{
  path: 'tienda',
  loadChildren: () =>import('./tienda/tienda.routes').then(m => m.TIENDA_ROUTES)
},



  {
    path: 'utl',
    loadChildren: () => import('./utl/utlroutes').then((m) => m.default),
  }
];
