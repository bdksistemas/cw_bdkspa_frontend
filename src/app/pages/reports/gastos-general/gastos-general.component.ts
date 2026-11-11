import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

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
  selector: 'app-gastos-general',
  templateUrl: './gastos-general.component.html',
  styleUrl: './gastos-general.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GastosGeneralComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte - Gastos Generales';

  displayedColumns: any[] = [
    'ID',
    'FechaHora',
    'Descripcion',
    'Motivo',
    'ImporteTotal',
    'Provedor',
    
    // 'Estatus',
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

    //Inicializamos los arrays de datos
  }
  provedores: any[] = [
    // {proveedor: 0, nomproveedor: 'SELECCIONA UN PROVEEDOR'},
  ];
  getProveedores() {
    this.apiService.getProveedores(this.sucursal).subscribe((data: any) => {
      // console.log('PROVEEDORES: ', data);
      this.provedores = data.data;
    });
  }
  conceptos: any[] = [
    // {concepto: 0, nomconcepto: 'SELECCIONA UN CONCEPTO'},
  ];
  getConceptos() {
    this.apiService.getConceptos(this.sucursal).subscribe((data: any) => {
      console.log('CONCEPTOS: ', data);
      this.conceptos = data.data;
    });
  }
  ngOnInit() {
    this.getProveedores();
    // this.getConceptos();

    this.getCajeros();
    this.getTipoTratamiento();

    //Asignamos la fecha inicial y final al día actual (fecha local, no UTC)
    const hoy = new Date();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaInicial = `${hoy.getFullYear()}-${mm}-${dd}`;
    this.fechaFinal = this.fechaInicial;

    //Al entrar solo cargamos lo del día actual
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.concepto, this.provedor, false);
  }

  tipoTrataniento: any[] = [];
  getTipoTratamiento() {
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
      doc.save('reporte-gastos-general.pdf');
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
    this.saveAsExcelFile(excelBuffer, 'reporte-gastos-general');
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
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.concepto, this.provedor);
  }
  concepto: number = 0;
  cambioConcepto($event: any) {
    this.concepto = $event.target.value;
  }
  provedor: number = 0;
  cambioProvedor($event: any) {
    this.provedor = $event.target.value;
  }

  cajeros: any[] = [];
  getCajeros() {
    this.apiService.getCajeros(this.sucursal).subscribe((data: any) => {
      this.cajeros = data.data;
    });
  }

  tipoSuscripcion:any = 0;
  cambioTipoSuscripcion(event: any) {
    this.tipoSuscripcion = event.target.value;
  }

  tipoMovimiento:any = 0;
  cambioTipoMovimiento(event: any) {
    this.tipoMovimiento = event.target.value;
  }

  private consulta?: Subscription;
  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string, concepto: any = 0, proveedor: any = 0, avisar: boolean = true) {
    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getGastos(
        fecjaInicial,
        fechaFinal,
        this.sucursal,
        concepto,
        proveedor
      )
      .subscribe((data: any) => {

        //Vaciamos la tabla
        this.dataSource = new MatTableDataSource();

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
    //Proveedores y conceptos son por sucursal: reiniciamos y recargamos
    this.provedor = 0;
    this.concepto = 0;
    this.getProveedores();
  }


}
