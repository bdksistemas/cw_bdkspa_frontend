import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { AgendaComponent } from './agenda/agenda.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToasterComponent } from './toaster/toaster.component';
import { PagesComponent } from './pages.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
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
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../material/primeng.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CobroMembresiasComponent } from './reports/tratamientos-activos/tratamientos-activos.component';
import { VentasCreditoComponent } from './reports/ventas-credito/ventas-credito.component';
import { ListaClientesComponent } from './reports/lista-clientes/lista-clientes.component';
import { SalidasEfectivoComponent } from './reports/salidas-efectivo/salidas-efectivo.component';



@NgModule({
  declarations: [
    DashboardComponent,
    AgendaComponent,
    ToasterComponent,
    PagesComponent,
    TicketsComponent,
    IngresosComponent,
    VentasDetalladoComponent,
    TablaDatosComponent,
    VentasProductoComponent,
    VentasCategoriaComponent,
    AlmacenExistenciasComponent,
    AlmacenEntradasComponent,
    AlmacenSalidasComponent,
    AlmacenOrdenesCompraComponent,
    GastosGeneralComponent,
    BannerPublicitarioComponent,
    CobroMembresiasComponent,
    VentasCreditoComponent,
    ListaClientesComponent,
    SalidasEfectivoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    SharedModule,
    MaterialModule,
    PrimengModule,
    NgxUiLoaderModule

  ]
})
export class PagesModule {

}
