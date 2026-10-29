import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import { ApiServiceService } from '../../../services/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { Licencia } from '../../../interfaces/Licencia';
import { TipoSuscripciones } from '../../../interfaces/TipoSuscripciones';


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

    'Fecha',
    'Cliente',
    'Tratamiento',
    'Sesiones',
    'Sala',
    'Empleado',
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

    //! Obtener las sucursales
    this.obtenerSucursales();

    //! Obtener los tipos de suscripciones
    this.getTipoTratamiento();

    this.getCajeros();

    //Asignamos la fecha inicial y final a la fecha actual con el formato correcto
    const currentDate = new Date();
    this.fechaInicial = currentDate.toISOString().slice(0, 10);
    this.fechaFinal = currentDate.toISOString().slice(0, 10);

    //! Datos de la API
    this.apiService.getReporteIngresos().subscribe((data: any) => {
      this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
      this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
      this.MatPaginatorIntl.previousPageLabel = 'Anterior';
      this.dataSource = new MatTableDataSource(data.data);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });


  }


  tiposSuscripcion: TipoSuscripciones[] = []
  getTipoSuscripcion(){
    this.apiService.getTipoSuscripcion(this.sucursal).subscribe((data: any) => {
      this.tiposSuscripcion = data.data;
    });
  }

  tipoTrataniento:any[] = []
getTipoTratamiento(){
  this.apiService.getTipoTratamiento(this.sucursal).subscribe((data: any) => {
    this.tipoTrataniento = data.data;
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

  //Variables para fecha inicial y fecha final
  fechaInicial: string = '';
  fechaFinal: string = '';
  validarFechaInicial(event: any) {
    this.fechaInicial = event.value;

    //Si las fechas son iguales, mostramos un mensaje de adventencia
      if (this.fechaFinal == this.fechaInicial) {
      // this.toast.warning('Selecciona fecha final para filtrar tabla.', 'Advertencia', {
      //   positionClass: 'toast-bottom-center',
      //   timeOut: 5000,
      // });
      // return;
      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal);

    }

    //Si la fecha final es mayor a la fecha inicial, APLICAMOS EL FILTRADO.
    if (this.fechaFinal > this.fechaInicial) {
      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal);
    }

    //Si la fecha inicial es mayor a la fecha final, mostramos un mensaje de error
    if (this.fechaInicial > this.fechaFinal) {
      this.toast.warning('La fecha FINAL no puede ser menor.', 'Advertencia', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
      return;
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
      return;
    }

    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal);
  }

  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string , tmovimiento: any = null, empleado: any = null) {

        //! 999 es igual a TODOS, para que no entre nignun filtro.

    this.apiService
      .getReporteIngresos(fecjaInicial, fechaFinal, this.sucursal, tmovimiento, empleado)
      .subscribe((data: any) => {
        this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
        this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
        this.MatPaginatorIntl.previousPageLabel = 'Anterior';
        this.dataSource = new MatTableDataSource(data.data);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Mostramos un toast en medio de la pantalla para indicar que se ha filtrado la tabla
        this.toast.success('Se ha filtrado la tabla.', 'Filtrado', {
          /// Mostramos en la parte inferior y en el centro
          positionClass: 'toast-bottom-center',
          // Tiempo de duración del toast
          timeOut: 9000,
          // Mostramos el botón de cerrar
          closeButton: true,
        });
      });
  }

    //Obtener sucursales
    sucursal:any = 1;
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
      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal);
    }


    tipoSuscripcion:any = 0;
    cambioTipoSuscripcion(event: any) {
      this.tipoSuscripcion = event.target.value;
      // console.log('TIPO DE MOVIMIENTO ELEGIDO: ',this.tipoMovimiento);
      // console.log('TIPO DE SUSCRIPCION ELEGIDA: ',this.tipoSuscripcion);
      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.tipoMovimiento, this.empleadoSeleccionado);
    }

    tipoMovimiento:any = 0;
    cambioTipoMovimiento(event: any) {
      this.tipoMovimiento = event.target.value;
      // console.log('TIPO DE MOVIMIENTO ELEGIDO: ',this.tipoMovimiento);
      // console.log('TIPO DE SUSCRIPCION ELEGIDA: ',this.tipoSuscripcion);
      if(this.tipoSuscripcion == 0) {this.tipoSuscripcion = null;}

      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.tipoMovimiento, this.empleadoSeleccionado);
    }
    empleadoSeleccionado:any = 0;
    cambioEmpleado(event: any) {
      this.empleadoSeleccionado = event.target.value;
      // console.log('TIPO DE MOVIMIENTO ELEGIDO: ',this.tipoMovimiento);
      // console.log('TIPO DE SUSCRIPCION ELEGIDA: ',this.tipoSuscripcion);
      if(this.empleadoSeleccionado == 0) {this.empleadoSeleccionado = null;}

      this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.tipoMovimiento, this.empleadoSeleccionado);
    }

    cajeros: any[] = [];
  cajero: number = 0;
  getCajeros(){
    this.apiService.getCajeros(this.sucursal).subscribe((data: any) => {
      this.cajeros = data.data;
    });

  }

}
