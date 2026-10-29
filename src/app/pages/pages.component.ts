import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.css',
  encapsulation: ViewEncapsulation.None, // Permite que los estilos de ANGULAR MATERIAL se apliquen correctamente DESDE NUESTRO CSS
 animations: [
    //ingresa aqui las animaciones.
    // Fade In
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-in', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ opacity: 0 })),
    ]),
  ]),

  // Slide In From Left
  trigger('slideInFromLeft', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ transform: 'translateX(-100%)' })),
    ]),
  ]),

  // Scale Up
  trigger('scaleUp', [
    transition(':enter', [
      style({ transform: 'scale(0.5)' }),
      animate('300ms ease-in', style({ transform: 'scale(1)' })),
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ transform: 'scale(0.5)' })),
    ]),
  ]),

  // Rotate
  trigger('rotate', [
    transition(':enter', [
      style({ transform: 'rotate(-180deg)' }),
      animate('300ms ease-in', style({ transform: 'rotate(0deg)' })),
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ transform: 'rotate(180deg)' })),
    ]),
  ]),

  ]
})
export class PagesComponent {

  tituloProyecto:string = 'BDK';
  nombreUsuario= 'BDK';

  constructor(public router: Router, private AuthService: AuthService, private cdr: ChangeDetectorRef) {
    this.tituloProyecto = environment.TITULO_PROYECTO;
    this.nombreUsuario = environment.NOMBRE_USUARIO_SISTEMA;
  }



  expandedPanel: number | null = null;
  private isProcessing: boolean = false; // Agregar un indicador de procesamiento

  setExpandedPanel(panelIndex: number | null) {
    if (this.isProcessing) { // Si ya se está procesando una llamada, salir
      return;
    }

    this.isProcessing = true; // Establecer el indicador de procesamiento

    this.expandedPanel = null; // Cierra cualquier panel abierto

    // Abre el nuevo panel si el índice es diferente de null
    if (panelIndex !== null) {
      this.expandedPanel = panelIndex;
    }

    // Forzar la detección de cambios después de realizar cambios
    this.cdr.detectChanges();

    // Reiniciar el indicador de procesamiento después de un breve retraso para evitar llamadas duplicadas
    setTimeout(() => {
      this.isProcessing = false;
    }, 100); // Puedes ajustar el tiempo según sea necesario
  }

  @ViewChild('sidenav') sidenav!: MatSidenav;
  submenus: { [key: string]: boolean } = {};
  menuItems: any[] = [
    {
      titulo: 'INICIO',
      icono: 'fas fa-home',
      submenu: [
        { titulo: 'Dashboard', url: '/Inicio', icon: 'far fa-circle' },
      ]
    },
    {
      titulo: 'AGENDA',
      icono: 'fas fa-calendar',
      submenu: [
        { titulo: 'Agenda General', url: 'agenda/agenda-general', icon: 'far fa-circle' },
        { titulo: 'Agenda Por Sala', url: 'agenda/agenda-sala', icon: 'far fa-circle' },
        { titulo: 'Agenda Por Empleado', url: 'agenda/agenda-empleado', icon: 'far fa-circle' },

      ]
    },
    {
      titulo: 'REPORTES',
      icono: 'fas fa-chart-bar',
      submenu: [
        { titulo: 'Registro de Tickets', url: 'reportes/tickets', icon: 'far fa-circle' },
        { titulo: 'Tratamientos Activos', url: 'reportes/cobro-membresias', icon: 'far fa-circle' },
        { titulo: 'Tratamientos Realizados', url: 'reportes/ingresos', icon: 'far fa-circle' },
      ]
    },
    {
      titulo: 'VENTAS',
      icono: 'fas fa-tags',
      submenu: [
        // { titulo: 'Ventas Detallado', url: 'ventas/ventas-detallado', icon: 'far fa-circle' },
        { titulo: 'Ventas por Producto', url: 'ventas/ventas-producto', icon: 'far fa-circle' },
        { titulo: 'Ventas por Categoría', url: 'ventas/ventas-categoria', icon: 'far fa-circle' },
        { titulo: 'Ventas a Credito', url: 'ventas/ventas-credito', icon: 'far fa-circle' },
        { titulo: 'Registro de Ingresos', url: 'ventas/reporte-ingresos', icon: 'far fa-circle' },
      ]
    },
    {
      titulo: 'CLIENTES',
      icono: 'fas fa-warehouse',
      submenu: [
        { titulo: 'Lista de Clientes', url: 'socios/socios-activos', icon: 'far fa-circle' },
        // { titulo: 'Socios por Clase', url: 'socios/socios-clase', icon: 'far fa-circle' },
        // { titulo: 'Reporte de Asistencia', url: 'socios/socios-asistencia', icon: 'far fa-circle' },
        // { titulo: 'Reporte de Inscripciones', url: 'socios/socios-inscripciones', icon: 'far fa-circle' },
      ]
    },
    {
      titulo: 'ALMACEN',
      icono: 'fas fa-warehouse',
      submenu: [
        { titulo: 'Reporte de Existencias', url: 'almacen/existencias', icon: 'far fa-circle' },
        { titulo: 'Entradas de Almacén', url: 'almacen/entradas', icon: 'far fa-circle' },
        { titulo: 'Salidas de Almacén', url: 'almacen/salidas', icon: 'far fa-circle' },
        { titulo: 'Ordenes de Compra', url: 'almacen/ordenes-compra', icon: 'far fa-circle' },
      ]
    },
    {
      titulo: 'GASTOS',
      icono: 'fas fa-money-bill',
      submenu: [
        { titulo: 'Gastos y Compras', url: 'gastos/gastos-general', icon: 'far fa-circle' },
        { titulo: 'Gastos Programados', url: 'gastos/salida-efectivo', icon: 'far fa-circle' },

      ]
    },

  ];

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem('nom_cw')!;

    // Abre los submenús automáticamente al cargar la página
    this.menuItems.forEach(item => {
      if (item.submenu && item.submenu.length > 0) {
        this.submenus[item.titulo] = true;
      }
    });
  }

  logout(){

    this.AuthService.logout();
  }

}
