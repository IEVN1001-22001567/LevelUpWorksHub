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
  path: 'psychowellness',
  loadChildren: () =>import('./psychowellness/psychowellness.routes').then(m => m.PSYCHOWELLNESS_ROUTES)
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
  path: 'admincompras',
  loadChildren: () =>import('./admin/admincompras/admincompras.routes').then(m => m.ADMINCOMPRAS_ROUTES)
},

{
  path: 'carrito',
  loadChildren: () =>import('./carrito/carrito.routes').then(m => m.CARRITO_ROUTES)
},

{

    path: 'resenas',
    loadChildren: () => import('./resenas/resenas.routes').then(m => m.RESENAS_ROUTES)
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
    path: 'adminnoticias',
    loadChildren: () => import('./admin/adminnoticias/adminnoticias.routes').then(m => m.ADMIN_NOTICIAS_ROUTES)
  },
  {
    path:'adminpsycho',
    loadChildren: () => import('./admin/adminpsycho/adminpsycho.routes').then(m => m.ADMIN_PSYCHO_ROUTES)
  },

{
    path: 'adminmensajeria',
    loadChildren: () => import('./admin/adminmensajeria/adminmensajeria.routes').then(m => m.ADMIN_MENSAJERIA_ROUTES)
  },
  {
    path: 'adminsoporte',
    loadChildren: () =>import('./admin/adminsoporte/adminsoporte.routes').then(m => m.ADMIN_SOPORTE_ROUTES)
  }
,
  {
    path: 'adminresenas',
    loadChildren: () => import('./admin/adminresenas/adminresenas.routes').then(m => m.ADMIN_RESENAS_ROUTES)
  },


  {
    path: 'utl',
    loadChildren: () => import('./utl/utlroutes').then((m) => m.default),
  }
];
