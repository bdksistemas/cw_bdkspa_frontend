import { Component, ViewChild, OnInit } from '@angular/core';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ApiServiceService } from '../../services/api-service.service';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService, sucursalInicial } from '../../auth/auth.service';
import { alCambiarSucursal } from '../../services/sucursal.service';

export interface TicktData {
  ticket: number;
  fechaHora: string;
  nombreCajero: string;
  nombreMesero: string;
  numeroMesa: number;
  propina: number;
  pagoTotal: number;
  cambios: number;
  nombreCliente: string;
  nombreRepartidor: string;
  importeTotal: number;

}

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-tabla-datos',
  templateUrl: './tabla-datos.component.html',
  styleUrl: './tabla-datos.component.css',
})
export class TablaDatosComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Tickets';


  displayedColumns: any[] = [
    'Ticket',
    'Fecha',
    'NombreCategoria',
    'NombreCliente',
    'Importe',
    'Descuento',
    'ISR',
    'Total',
    'Abonado',
    'Saldo',
    'UltimoPago'

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
    this.obtenerCategorias();


    //Asignamos la fecha inicial y final al día actual (fecha local, no UTC)
    const hoy = new Date();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaInicial = `${hoy.getFullYear()}-${mm}-${dd}`;
    this.fechaFinal = this.fechaInicial;

    //Al entrar solo cargamos lo del día actual
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.categoria, false);
  }



  /** Gets the total cost of all transactions. */
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

  categorias: any[] = [];
  obtenerCategorias(){
    let sucursal = this.sucursal;
    this.apiService.getCategoriasCliente(sucursal).subscribe((data: any) => {
      this.categorias = data.data;
    });

  }
  categoria: any = 0;
  cambioCategoria(event: any) {
    this.categoria = event.target.value;
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
      doc.save('reporte-tickets.pdf');
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
    this.saveAsExcelFile(excelBuffer, 'reporte-tickets');
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
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));
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
    if (!this.fechaInicial) {
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
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.categoria);
  }

  private consulta?: Subscription;
  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string, categoria: any = 0, avisar: boolean = true) {
    this.consulta?.unsubscribe();
    this.consulta = this.apiService.getReporteTickets(fecjaInicial,fechaFinal, this.sucursal,categoria).subscribe((data: any) => {


        //Volvemos a obtener las categorias:
        this.obtenerCategorias();

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

    cambioSucusal(valor: any) {
      this.sucursal = Number(valor);
      this.categoria = 0; //las categorías son por sucursal; se recargan abajo
      this.obtenerCategorias();
    }

    estatusTicket: number = 0;
    cambioEstatus(event: any){
      this.estatusTicket = event.target.value;
    }


  // Generar datos de prueba para cada columna
  testData: any[] = [];
  dataPrueba() {
    for (let i = 1; i <= 100; i++) {
      const rowData: any = {};
      this.displayedColumns.forEach((column) => {
        switch (column) {
          case 'Ticket':
            rowData[column] = i;
            break;
          case 'FechaHora':
            rowData[column] = new Date().toLocaleString();
            break;
          case 'NombreSocio':
            rowData[column] = 'Nombre Socio ' + i;
            break;
          case 'Importe':
            rowData[column] = Math.floor(Math.random() * 1000);
            break;
          case 'Descuento':
            rowData[column] = Math.floor(Math.random() * 100);
            break;
          case 'ISR':
            rowData[column] = Math.floor(Math.random() * 100);
            break;
          case 'IEPS':
            rowData[column] = Math.floor(Math.random() * 100);
            break;
          case 'IVA':
            rowData[column] = Math.floor(Math.random() * 100);
            break;
          case 'Total':
            rowData[column] = Math.floor(Math.random() * 1000);
            break;
          case 'Abonado':
            rowData[column] = Math.floor(Math.random() * 1000);
            break;
          case 'Saldo':
            rowData[column] = Math.floor(Math.random() * 1000);
            break;
          case 'UltimoPago':
            rowData[column] = Math.floor(Math.random() * 1000);
            break;
          case 'NombreCajero':
            rowData[column] = 'Nombre Cajero ' + i;
            break;
          default:
            rowData[column] = '';
            break;
        }
      });
      this.testData.push(rowData);
    }
  }

}
