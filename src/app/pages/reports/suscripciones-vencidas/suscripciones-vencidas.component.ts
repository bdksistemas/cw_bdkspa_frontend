import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import { ApiServiceService } from '../../../services/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/auth.service';
import { Licencia } from '../../../interfaces/Licencia';

@Component({
  selector: 'app-suscripciones-vencidas',
  templateUrl: './suscripciones-vencidas.component.html',
  styleUrl: './suscripciones-vencidas.component.css'
})
export class SuscripcionesVencidasComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Suscripciones - Vencidas';

  displayedColumns: any[] = [
    'NumeroSesion',
    'Hora',
    'Tratamiento',
    'Cliente',
    'Empleado',
    'Comentarios',
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    console.log(this.dataSource.filteredData);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      // console.log(this.dataSource.filteredData);
    }
  }

  downloadPDF() {
    const doc = new jsPDF('landscape'); // Establece la orientación a landscape
    doc.text(' ', 10, 10);
    // Suponiendo que tienes una tabla con id 'my-table' en tu HTML
    const htmlTable = document.getElementById('my-table') as HTMLTableElement;
    if (htmlTable) {
      autoTable(doc, { html: htmlTable });
      doc.save('reporte-ingresos.pdf');
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
    this.saveAsExcelFile(excelBuffer, 'reporte-ingresos');
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
  sucursal: number = 1;
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

      // this.toast.success('Se ha filtrado la tabla.', 'Filtrado', {
      //   positionClass: 'toast-bottom-center',
      //   timeOut: 9000,
      //   closeButton: true,
      // });
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
  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string) {
    this.apiService
      .getSuscripcionesVencidas(fecjaInicial, fechaFinal, this.sucursal)
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
  ngOnInit() {

    this.obtenerSucursales();

    //Asignamos la fecha inicial y final a la fecha actual con el formato correcto
    const currentDate = new Date();
    this.fechaInicial = currentDate.toISOString().slice(0, 10);
    this.fechaFinal = currentDate.toISOString().slice(0, 10);

    //! Datos de la API
    this.apiService.getSuscripcionesVencidas().subscribe((data: any) => {
      this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
      this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
      this.MatPaginatorIntl.previousPageLabel = 'Anterior';
      this.dataSource = new MatTableDataSource(data.data);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  // Generar datos de prueba para cada columna
  testData: any[] = [];
  dataPrueba() {
    for (let i = 1; i <= 100; i++) {
      const rowData: any = {};
      this.displayedColumns.forEach((column) => {
        switch (column) {
          case 'ID':
            rowData[column] = i;
            break;
          case 'FechaHora':
            rowData[column] = new Date().toLocaleString();
            break;
          case 'IngresoDe':
            rowData[column] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'FechaReferencia':
            rowData[column] = `Referencia ${i}`;
            break;
          case 'NombreCajero':
            rowData[column] = `Cajero  ${i}`;
            break;
          case 'FormaPago':
            rowData[column] = `Transferencia ${i}`;
            break;
          case 'Referencia':
            rowData[column] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'ImporteTotal':
            rowData[column] = rowData['IngresoDe'] + rowData['Referencia'];
            break;
          case 'Cambios':
            rowData[column] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'NombreCliente':
            rowData[column] = `Cliente ${i}`;
            break;
          case 'NombreRepartidor':
            rowData[column] = `Repartidor ${i}`;
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
