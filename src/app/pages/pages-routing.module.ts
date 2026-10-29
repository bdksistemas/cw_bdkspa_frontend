import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToasterComponent } from './toaster/toaster.component';
import { authGuard } from '../guards/auth.guard';
import { TicketsComponent } from './reports/tickets/tickets.component';
import { IngresosComponent } from './reports/ingresos/ingresos.component';
import { VentasDetalladoComponent } from './reports/ventas-detallado/ventas-detallado.component';
import { TablaDatosComponent } from './tabla/tabla-datos.component';
import { VentasProductoComponent } from './reports/ventas-producto/ventas-producto.component';
import { VentasCategoriaComponent } from './reports/ventas-categoria/ventas-categoria.component';
import { AlmacenExistenciasComponent } from './reports/almacen-existencias/almacen-existencias.component';
import { AlmacenEntradasComponent } from './reports/almacen-entradas/almacen-entradas.component';
import { AlmacenSalidasComponent } from './reports/almacen-salidas/almacen-salidas.component';
import { AlmacenOrdenesCompraComponent } from './reports/almacen-ordenes-compra/almacen-ordenes-compra.component';
import { GastosGeneralComponent } from './reports/gastos-general/gastos-general.component';
import { BannerPublicitarioComponent } from './banner-publicitario/banner-publicitario.component';
import { autorizationGuard } from '../guards/autorization.guard';
import { CobroMembresiasComponent } from './reports/tratamientos-activos/tratamientos-activos.component';
import { VentasCreditoComponent } from './reports/ventas-credito/ventas-credito.component';
import { SociosActivosComponent } from './reports/socios-activos/socios-activos.component';
import { SalidasEfectivoComponent } from './reports/salidas-efectivo/salidas-efectivo.component';
import { AgendaGeneralComponent } from './reports/agenda-general/agenda-general.component';
import { AgendaSalaComponent } from './reports/agenda-sala/agenda-sala.component';
import { AgendaEmpleadoComponent } from './reports/agenda-empleado/agenda-empleado.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [authGuard],

    children: [
      {
        path: 'Inicio',
        component: DashboardComponent,
        data: { titulo: 'Dashboard' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'reportes/tickets',
        component: TablaDatosComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'reportes/cobro-membresias',
        component: CobroMembresiasComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'reportes/ingresos',
        component: IngresosComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      //VENTAS
      {
        path: 'ventas/ventas-producto',
        component: VentasProductoComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'ventas/ventas-categoria',
        component: VentasCategoriaComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'ventas/reporte-ingresos',
        component: VentasDetalladoComponent,
        // component: GastosGeneralComponent, 

        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'ventas/ventas-credito',
        component: VentasCreditoComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },

      // Socios
      {
        path: 'socios/socios-activos',
        component: SociosActivosComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },



      //ALMACEN
      {
        path: 'almacen/existencias',
        component: AlmacenExistenciasComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },
      {
        path: 'almacen/entradas',
        component: AlmacenEntradasComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },
      {
        path: 'almacen/salidas',
        component: AlmacenSalidasComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },
      {
        path: 'almacen/ordenes-compra',
        component: AlmacenOrdenesCompraComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },

      //GASTOS

      {
        path: 'gastos/gastos-general',
        component: GastosGeneralComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },
      {
        path: 'gastos/salida-efectivo',
        component: SalidasEfectivoComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]

      },

      //!AGENDA

      {
        path: 'agenda/agenda-general',
        component: AgendaGeneralComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'agenda/agenda-sala',
        component: AgendaSalaComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },
      {
        path: 'agenda/agenda-empleado',
        component: AgendaEmpleadoComponent,
        data: { animation: 'fadeIn' },
        canActivate: [autorizationGuard]
      },

      // Pruebas de componentes

      {
        path: 'toaster',
        component: ToasterComponent,
        data: { titulo: 'Toaster' },
      },
      { path: '', redirectTo: '/dashboard/Inicio', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
