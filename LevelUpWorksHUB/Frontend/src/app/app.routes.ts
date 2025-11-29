import { Routes } from '@angular/router';

export const routes: Routes = [
{
  path: 'inicio',
  loadChildren: () => import('./inicio/inicioroutes').then(m => m.default)
},
{
  path: 'personalizarperfil',
  loadChildren: () => import('./personalizarperfil/personalizarperfil.routes').then(m => m.PERSONALIZARPERFIL_ROUTES)
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
  path: 'login',
  loadChildren: () => import('./login/login.routes').then(m => m.LOGIN_ROUTES)
},
{
  path: 'actualizaciones',
  loadChildren: () =>import('./actualizaciones/actualizaciones.routes').then(m => m.ACTUALIZACIONES_ROUTES)
},

{
  path: 'biblioteca',
  loadChildren: () =>import('./biblioteca/biblioteca.routes').then(m => m.BIBLIOTECA_ROUTES)
},

{
  path: 'gestioncompras',
  loadChildren: () =>import('./gestion-compras/gestion-compras.routes').then(m => m.GESTIONCOMPRAS_ROUTES)
},

{
  path: 'carrito',
  loadChildren: () =>import('./carrito/carrito.routes').then(m => m.CARRITO_ROUTES)
},


//RutasADmin
{
  path: 'adminusuarios',
  loadChildren: () =>import('./admin/adminusuarios/adminusuarios.routes').then(m => m.ADMINUSUARIOS_ROUTES)
},
{
  path: 'adminjuegos',
  loadChildren: () =>import('./admin/adminjuegos/adminjuegos.routes').then(m => m.ADMINJUEGOS_ROUTES)
},
{
  path: 'utl',
    loadChildren: () => import('./utl/utlroutes').then((m) => m.default),
  }
];
