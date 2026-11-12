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
  selector: 'app-ventas-credito',
  templateUrl: './ventas-credito.component.html',
  styleUrl: './ventas-credito.component.css'
})
export class VentasCreditoComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Ventas - Creditos';

  displayedColumns: any[] = [
    'Ticket',
    'Fecha',
    'NombreCliente',
    'Total',
    'Abonado',
    'Saldo',
    'Pagos',
    'Frecuencia',
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //Obtenemos la tabla, para poder usarla y descargar en PDF y Excel
  @ViewChild(MatTable) table!: MatTable<any>;

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
    this.traerDatosAPI();
  }

  getTotalCost(columna: string) {
    return sumarColumna(this.dataSource, columna);
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
      doc.save('reporte-ventas-productos.pdf');
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
    this.saveAsExcelFile(excelBuffer, 'reporte-ventas-productos');
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

  sucursal: number = sucursalInicial();
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));

  //Sin filtros: todas las ventas a crédito con saldo pendiente de la sucursal activa
  private consulta?: Subscription;
  traerDatosAPI() {
    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getVentasCredito(this.sucursal)
      .subscribe((data: any) => {
        this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
        this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
        this.MatPaginatorIntl.previousPageLabel = 'Anterior';
        this.dataSource = new MatTableDataSource(data.data);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

    cambioSucusal(valor: any) {
      this.sucursal = Number(valor);
      this.traerDatosAPI();
    }


}
