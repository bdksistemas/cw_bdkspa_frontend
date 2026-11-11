import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import { ApiServiceService } from '../../../services/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService, sucursalInicial } from '../../../auth/auth.service';
import { alCambiarSucursal } from '../../../services/sucursal.service';
import { sumarColumna } from '../../../shared/sumar-columna';
@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.css'
})
export class ListaClientesComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Clientes - Activos';

  displayedColumns: any[] = [
    'FechaAlta',
    'NombreCliente',
    'Celular',
    'Categoria',
    'Saldo',
    'UltimoMovimiento',
    'DiasInactivo',
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

  categorias: any[] = [];
  obtenerCategorias(){
    let sucursal = this.sucursal;
    this.apiService.getCategoriasCliente(sucursal).subscribe((data: any) => {
      this.categorias = data.data;
    });

  }
  categoriaSeleccionada:number = 0;
  cambioCategoria(event: any) {
    this.categoriaSeleccionada = Number(event.target.value);
  }


  getTotalCost(columna: string) {
    return sumarColumna(this.dataSource, columna);
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
  sucursal: number = sucursalInicial();
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));
  fechaInicial: string = '';
  fechaFinal: string = '';
  validarFechaInicial(event: any) {
    this.fechaInicial = event.value;

    //Si la fecha inicial es mayor a la fecha final, mostramos un mensaje de error
    if (this.fechaFinal && this.fechaInicial > this.fechaFinal) {
      this.toast.warning('La fecha FINAL no puede ser menor.', 'Advertencia', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
    }
  }
  validarFechaFinal(event: any) {
    this.fechaFinal = event.value;

    //Evaluamos la fecha final, si es menor a la fecha inicial, mostramos un mensaje de error
    if (this.fechaInicial && this.fechaFinal && this.fechaFinal < this.fechaInicial) {
      this.fechaFinal = this.fechaInicial;
      this.toast.error('La fecha FINAL no puede ser menor.', 'Error', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
    }
  }

  //Los filtros solo guardan su valor; la consulta se hace al presionar "Aplicar filtros".
  //Fechas opcionales: sin fechas = todos los clientes activos; con fechas = altas en ese rango.
  aplicarFiltros() {
    const hayUna = !!this.fechaInicial || !!this.fechaFinal;
    const hayAmbas = !!this.fechaInicial && !!this.fechaFinal;
    if ((hayUna && !hayAmbas) || (hayAmbas && this.fechaFinal < this.fechaInicial)) {
      this.toast.error('Revisa el rango de fechas.', 'Error', {
        positionClass: 'toast-bottom-center',
        timeOut: 5000,
      });
      return;
    }
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal, this.categoriaSeleccionada);
  }

  private consulta?: Subscription;
  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string, categoria: number = 0, avisar: boolean = true) {
    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getListaClientes(fecjaInicial || null, fechaFinal || null, this.sucursal, categoria)
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
            positionClass: 'toast-bottom-center',
            timeOut: 9000,
            closeButton: true,
          });
        }
      });
  }
    cambioSucusal(valor: any) {
      this.sucursal = Number(valor);
      this.categoriaSeleccionada = 0; //las categorías son por sucursal; se recargan abajo
      this.obtenerCategorias();
    }
  ngOnInit() {

    this.obtenerCategorias();


    //Por defecto: todos los clientes activos, sin fechas
    this.traerDatosFiltradosAPI('', '', this.categoriaSeleccionada, false);
  }
}
