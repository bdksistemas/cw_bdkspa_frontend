import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import { ApiServiceService } from '../../../services/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService, sucursalInicial } from '../../../auth/auth.service';
import { alCambiarSucursal } from '../../../services/sucursal.service';
import { Subscription } from 'rxjs';


import { sumarColumna } from '../../../shared/sumar-columna';
/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrl: './ingresos.component.css',
})
export class IngresosComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte - Tratamientos Realizados';


  displayedColumns: any[] = [

    'Ticket',
    'Fecha',
    'Cliente',
    'Tratamiento',
    'Sesiones',
    'Tomadas',
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //Obtenemos la tabla, para poder usarla y descargar en PDF y Excel
  @ViewChild(MatTable) table!: MatTable<any>;
  rowData: any;

  constructor(
    private MatPaginatorIntl: MatPaginatorIntl,
    private apiService: ApiServiceService,
    private toast: ToastrService,
    private authService: AuthService
  ) {
    this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
    this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
    this.MatPaginatorIntl.previousPageLabel = 'Anterior';

  }

  ngOnInit() {


    //! Obtener los tipos de suscripciones
    this.getTipoTratamiento();
    //Por defecto: el día actual (fecha local, no UTC)
    const hoy = new Date();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaInicial = `${hoy.getFullYear()}-${mm}-${dd}`;
    this.fechaFinal = this.fechaInicial;

    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.tratamientoFiltro(), false);

  }


  tipoTrataniento:any[] = []
getTipoTratamiento(){
  this.apiService.getTipoTratamiento(this.sucursal).subscribe((data: any) => {
    this.tipoTrataniento = data.data;
  });
}

  getTotalCost(columna: string) {
    return sumarColumna(this.dataSource, columna);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      doc.save('reporte-almacen-entradas.pdf');
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
    this.saveAsExcelFile(excelBuffer, 'reporte-almacen-entradas');
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

  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  //Los filtros solo guardan su valor; la consulta se hace al presionar "Aplicar filtros"
  //Variables para fecha inicial y fecha final
  fechaInicial: string = '';
  fechaFinal: string = '';
  validarFechaInicial(event: any) {
    this.fechaInicial = event.value;
    if (this.fechaInicial > this.fechaFinal) {
      this.toast.warning('La fecha FINAL no puede ser menor.', 'Advertencia', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
    }
  }

  validarFechaFinal(event: any) {
    this.fechaFinal = event.value;
    if (!this.fechaInicial) {
      this.toast.error('La fecha inicial no puede estar vacía.', 'Error', {
        positionClass: 'toast-top-center',
        timeOut: 5000,
      });
      return;
    }
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
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.tratamientoFiltro());
  }

  //"TODOS" (0 / 'null') se envía como null para que el backend no filtre
  private tratamientoFiltro(): any {
    return (!this.tipoMovimiento || this.tipoMovimiento == 'null') ? null : this.tipoMovimiento;
  }

  private consulta?: Subscription;
  traerDatosFiltradosAPI(fechaInicial: string, fechaFinal: string, tmovimiento: any = null, avisar: boolean = true) {

        //! 999 es igual a TODOS, para que no entre nignun filtro.

    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getReporteIngresos(fechaInicial, fechaFinal, this.sucursal, tmovimiento)
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

    sucursal:any = sucursalInicial();
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));
    cambioSucusal(valor: any) {
      this.sucursal = Number(valor);
      //Tratamientos y empleados son por sucursal: reiniciamos y recargamos catálogos
      this.tipoMovimiento = 0;
      this.getTipoTratamiento();
    }


    tipoSuscripcion:any = 0;
    cambioTipoSuscripcion(event: any) {
      this.tipoSuscripcion = event.target.value;
    }

    tipoMovimiento:any = 0;
    cambioTipoMovimiento(event: any) {
      this.tipoMovimiento = event.target.value;
    }

}
