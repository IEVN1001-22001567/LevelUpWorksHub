import { SOPORTETEC_ROUTES } from './soportetec/soportetec.routes';
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
  path: 'soportetec',
  loadChildren: () =>import('./soportetec/soportetec.routes').then(m => m.SOPORTETEC_ROUTES)
},
{
  path: 'social',
  loadChildren: () =>import('./social/social.routes').then(m => m.SOCIAL_ROUTES)
},
{
  path: 'licencias',
  loadChildren: () =>import('./licencias/licencias.routes').then(m => m.LICENCIA_ROUTES)
},

{
  path: 'actualizaciones',
  loadChildren: () =>import('./actualizaciones/actualizaciones.routes').then(m => m.ACTUALIZACIONES_ROUTES)
},

  {
    path: 'utl',
    loadChildren: () => import('./utl/utlroutes').then((m) => m.default),
  }
];
