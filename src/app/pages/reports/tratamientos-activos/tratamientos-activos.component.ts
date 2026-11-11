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
import { alCambiarSucursal } from '../../../services/sucursal.service';
import { Subscription } from 'rxjs';


import { sumarColumna } from '../../../shared/sumar-columna';
@Component({
  selector: 'app-cobro-membresias',
  templateUrl: './tratamientos-activos.component.html',
  styleUrl: './tratamientos-activos.component.css'
})
export class CobroMembresiasComponent {
  titulo: string = 'Reporte - Tratamientos Activos';
  verde: string = 'var(--verde)';

  displayedColumns: any[] = [

    'Ticket',
    'Fecha',
    'NombreCliente',
    'Tratamiento',
    'Sesiones',
    'Tomadas',
    'UltimaSesion',
    'ProximaSesion',
    'Vigencia'
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

    this.traerDatosFiltradosAPI(this.tipoMovimiento, false);
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
  aplicarFiltros() {
    this.traerDatosFiltradosAPI(this.tipoMovimiento);
  }

  private consulta?: Subscription;
  //tmovimiento = código del tratamiento (0/null = todos)
  traerDatosFiltradosAPI(tmovimiento: any = null, avisar: boolean = true) {

    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getCobroMembresias(this.sucursal, tmovimiento)
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
      this.tipoMovimiento = 0; //los tratamientos son por sucursal; se recargan abajo
      this.getTipoTratamiento();
    }

    //Tratamiento elegido (el selector "Selecciona Tratamiento" usa este handler)
    tipoMovimiento:any = 0;
    cambioTipoMovimiento(event: any) {
      //La opción "TODOS" trae value="null" (texto): se guarda como 0 (= todos)
      const valor = event.target.value;
      this.tipoMovimiento = valor === 'null' ? 0 : valor;
    }

}
