import { Component, ViewChild } from '@angular/core';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ApiServiceService } from '../../../services/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService, sucursalInicial } from '../../../auth/auth.service';
import { Licencia } from '../../../interfaces/Licencia';
import { Subscription } from 'rxjs';

export interface TicktData {
  ticket: number;
  fechaHora: string;
  nombreCajero: string;
  nombreMesero: string;
  numeroMesa: number;
  importeTotal: number;
  propina: number;
  pagoTotal: number;
  cambios: number;
  nombreCliente: string;
  nombreRepartidor: string;
}
@Component({
  selector: 'app-ventas-detallado',
  templateUrl: './ventas-detallado.component.html',
  styleUrl: './ventas-detallado.component.css',
})
export class VentasDetalladoComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Ventas - Ingresos';

  displayedColumns: any[] = [
    'ID',
    'FechaHora',
    'IngresoDe',
    'FechaReferencia',
    'NombreCliente',
    'NombreCajero',
    'FormaPago',
    'Referencia',
    'ImporteTotal',
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //Obtenemos la tabla, para poder usarla y descargar en PDF y Excel
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    private MatPaginatorIntl: MatPaginatorIntl,
    private apiService: ApiServiceService,
    private toast: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.obtenerSucursales();
    this.getCajeros();


    //Asignamos la fecha inicial y final al día actual (fecha local, no UTC)
    const hoy = new Date();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaInicial = `${hoy.getFullYear()}-${mm}-${dd}`;
    this.fechaFinal = this.fechaInicial;

    //Al entrar solo cargamos lo del día actual
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.cajero, false);
  }
  cambioCajero(event: any) {
    this.cajero= event.target.value;
  }
  cajeros: any[] = [];
  cajero: number = 0;
  getCajeros(){
    this.apiService.getCajeros(this.sucursal).subscribe((data: any) => {
      this.cajeros = data.data;
    });

  }

  getTotalCost(columna: any) {
    //Si existen elementos filtrados:
    if (this.dataSource.filteredData.length > 0) {
      let sumaTotal = 0;
      this.dataSource.filteredData.forEach((row) => {
        sumaTotal += row[columna];
      });
      return sumaTotal;
    }
    let sumaTotal = 0;
    this.dataSource.data.forEach((row) => {
      sumaTotal += row[columna];
    });
    return sumaTotal;
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadPDF() {
    const doc = new jsPDF('landscape'); // Establece la orientación a landscape
    doc.text(' ', 10, 10);
    // Suponiendo que tienes una tabla con id 'my-table' en tu HTML
    const htmlTable = document.getElementById('my-table') as HTMLTableElement;
    if (htmlTable) {
      autoTable(doc, { html: htmlTable });
      doc.save('reporte-ventas-detallado.pdf');
    } else {
      console.error('No se encontró la tabla con el ID "my-table"');
    }
  }

  downloadExcel() {
    const worksheet: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.dataSource.filteredData
    );
    const workbook: xlsx.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'reporte-ventas-detallado');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName + '.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  //Variables para fecha inicial y fecha final
  sucursal: number = sucursalInicial();
  fechaInicial: string = '';
  fechaFinal: string = '';
  validarFechaInicial(event: any) {
    this.fechaInicial = event.value;

    //Si la fecha inicial es mayor a la fecha final, mostramos un mensaje de error
    if (this.fechaInicial > this.fechaFinal) {
      this.toast.warning('La fecha FINAL no puede ser menor.', 'Advertencia', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
    }
  }

  validarFechaFinal(event: any) {
    this.fechaFinal = event.value;

    //Si la fecha inicial esta vacia, mostramos un mensaje de error
    if (this.fechaInicial == null || this.fechaInicial == undefined) {
      this.toast.error('La fecha inicial no puede estar vacía.', 'Error', {
        positionClass: 'toast-top-center',
        timeOut: 5000,
      });
      return;
    }

    //Evaluamos la fecha final, si es menor a la fecha inicial, mostramos un mensaje de error
    if (this.fechaFinal < this.fechaInicial) {
      this.fechaFinal = this.fechaInicial;
      this.toast.error('La fecha FINAL no puede ser menor.', 'Error', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
    }
  }

  //Los filtros solo guardan su valor; la consulta se hace al presionar "Aplicar filtros"
  aplicarFiltros() {
    if (!this.fechaInicial || !this.fechaFinal || this.fechaFinal < this.fechaInicial) {
      this.toast.error('Revisa el rango de fechas.', 'Error', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
      return;
    }
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.cajero);
  }

  private consulta?: Subscription;
  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string, cajero: any = 0, avisar: boolean = true) {
    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getReporteVentasDetalle(fecjaInicial, fechaFinal, this.sucursal, cajero)
      .subscribe((data: any) => {
        this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
        this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
        this.MatPaginatorIntl.previousPageLabel = 'Anterior';
        this.dataSource = new MatTableDataSource(data.data);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Mostramos un toast en medio de la pantalla para indicar que se ha filtrado la tabla
        if (avisar) {
          this.toast.success('Se ha filtrado la tabla.', 'Filtrado', {
            /// Mostramos en la parte inferior y en el centro
            positionClass: 'toast-bottom-center',
            // Tiempo de duración del toast
            timeOut: 9000,
            // Mostramos el botón de cerrar
            closeButton: true,
          });
        }
      });
  }

    //Obtener sucursales
    sucursales: Licencia[] = [];
    obtenerSucursales() {
      //Verificamos si tenemos las sucursales dentro del authService
      let sucursales = this.authService.getLicencias();
      if (sucursales != null || sucursales != undefined) {
        this.sucursales = sucursales;
      } else {
        //Si no los tenemos en el authService, los obtenemos del localStorage.
        this.sucursales = this.authService.setLicencias();
      }
    }
    cambioSucusal(event: any) {
      this.sucursal = event.target.value;
      this.cajero = 0; //los cajeros son por sucursal; se recargan abajo
      this.getCajeros();
    }

  // Generar datos de prueba para cada columna
  testData: any[] = [];
  dataPrueba() {
    for (let i = 1; i <= 100; i++) {
      const rowData: any = {};
      this.displayedColumns.forEach((column) => {
        switch (column) {
          case 'NombreCategoria':
            rowData[column] = i;
            break;
          case 'IDProducto':
            rowData[column] = i;
            break;
          case 'NombreProducto':
            rowData[column] = `Cajero ${i}`;
            break;
          case 'Cantidad':
            rowData[column] = i;
            break;

          case 'PrecioVenta':
            rowData[column] = i;
            break;
          case 'Descuento':
            rowData[column] = i;
            break;
          case 'IEPS':
            rowData[column] = i;
            break;
          case 'IVA':
            rowData[column] = i;
            break;
          case 'ISR':
            rowData[column] = i;
            break;
          case 'ImporteTotal':
            rowData[column] = i;
            break;
          case 'Costo':
            rowData[column] = i;
            break;
          case 'Importe':
            rowData[column] = i;
            break;
          case 'Ganancia':
            rowData[column] = i;
            break;

          // case 'FechaHora':
          //   rowData[column] = new Date().toLocaleString();
          //   break;
          // case 'NombreCajero':
          //   rowData[column] = `Cajero ${i}`;
          //   break;
          // case 'NombreMesero':
          //   rowData[column] = `Mesero ${i}`;
          //   break;

          // case 'ImporteTotal':
          //   rowData[column] = Number(Math.floor(Math.random() * 1000) + 1);
          //   break;
          // case 'Propina':
          //   rowData[column] = Math.floor(Math.random() * 100) + 1;
          //   break;
          // case 'PagoTotal':
          //   rowData[column] = rowData['ImporteTotal'] + rowData['Propina'];
          //   break;
          // case 'Cambios':
          //   rowData[column] = Math.floor(Math.random() * 100) + 1;
          //   break;
          // case 'NombreCliente':
          //   rowData[column] = `Cliente ${i}`;
          //   break;
          // case 'NombreRepartidor':
          //   rowData[column] = `Repartidor ${i}`;
          //   break;
          default:
            rowData[column] = '';
            break;
        }
      });
      this.testData.push(rowData);
    }
  }
}
