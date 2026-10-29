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
  selector: 'app-socios-clase',
  templateUrl: './socios-clase.component.html',
  styleUrl: './socios-clase.component.css',
})
export class SociosClaseComponent {
  verde: string = 'var(--verde)';
  titulo: string = 'Reporte de Socios - Clases';

  displayedColumns: any[] = ['Clase', 'Horario', 'IDSocio', 'NombreSocio'];
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
    this.dataSource.data = []; // O reemplaza con datos si los tienes

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

  interpretacionHora(hora: any) {
    /*!
      Ejemplo de hora a recibir:  700,1400, 730, 1500,2200

      Ejemplo de hora a devolver: 7:00,14:00, 7:30, 15:00,22:00
    */

    //Convertimos la hora a string
    let horaString = hora.toString();

    //Si la hora es menor a 1000, le agregamos un 0 al inicio
    if (horaString.length == 3) {
      horaString = '0' + horaString;
    }

    //Obtenemos la hora y los minutos
    let horaFinal = horaString.slice(0, 2);
    let minutos = horaString.slice(2, 4);

    //Devolvemos la hora con el formato correcto
    return `${horaFinal}:${minutos}`;
  }

  //Variables para fecha inicial y fecha final
  sucursal: number = 1;
  fechaInicial: string = '';
  fechaFinal: string = '';
  validarFechaInicial(event: any) {
    this.fechaInicial = event.value;

    //Si las fechas son iguales, mostramos un mensaje de adventencia
    if (this.fechaFinal == this.fechaInicial) {
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

  traerDatosFiltradosAPI(fecjaInicial: string, fechaFinal: string) {
    this.apiService
      .getReporteIngresos(fecjaInicial, fechaFinal, this.sucursal)
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
    this.obtenerClases();
  }

  clases: any[] = [];
  obtenerClases() {
    this.apiService.getClases(this.sucursal).subscribe((data: any) => {
      this.clases = data;
    });
  }

  obtenerHorarios() {
    this.apiService
      .getHorarios(this.sucursal, this.clase)
      .subscribe((data: any) => {
        this.clases = data;
      });
  }

  cambioSucusal(event: any) {
    this.sucursal = event.target.value;
    this.traerDatosFiltradosAPI(this.fechaInicial, this.fechaFinal);
  }

  clase: any = 0;
  listaSocios: any[] = [];
  cambioClase(event: any) {
    //! Este es el ID de la clase seleccionada:
    this.clase = event.target.value;
    this.apiService
      .getHorarios(this.sucursal, this.clase)
      .subscribe((data: any) => {
        this.horarios = data;
      });
  }
  horarios: any[] = [];
  horario: any = 0;
  cambioHorario(event: any) {}
  ngOnInit() {
    this.obtenerSucursales();

    //Asignamos la fecha inicial y final a la fecha actual con el formato correcto
    const currentDate = new Date();
    this.fechaInicial = currentDate.toISOString().slice(0, 10);
    this.fechaFinal = currentDate.toISOString().slice(0, 10);

     setTimeout(() => {

        this.toast.info('Seleccione una CLASE para filtrar la tabla.', 'Información', {
          positionClass: 'toast-bottom-center',
          timeOut: 9000,
        });
     }, 1500);


    //! Datos de la API
    // this.apiService.getReporteIngresos().subscribe((data: any) => {
    //   this.MatPaginatorIntl.itemsPerPageLabel = 'Registros por página';
    //   this.MatPaginatorIntl.nextPageLabel = 'Siguiente';
    //   this.MatPaginatorIntl.previousPageLabel = 'Anterior';
    //   this.dataSource = new MatTableDataSource(data.data);

    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // });
  }
  // Generar datos de prueba para cada columna
  testData: any[] = [];
  dataPrueba() {
    for (let i = 1; i <= 100; i++) {
      const rowData: any = {};
      this.displayedColumns.forEach((column) => {
        switch (column) {
          case 'Clase':
            rowData[column] = 'Clase ' + i;
            break;
          case 'Horario':
            rowData[column] = 'Horario ' + i;
            break;
          case 'IDSocio':
            rowData[column] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'NombreSocio':
            rowData[column] = `Socio ${i}`;
            break;
          default:
            rowData[column] = 'N/A';
            break;
        }
      });
      this.testData.push(rowData);
    }
  }

  horariosFiltrados: any[] = [];
  listaSociosFormato: any[] = [];
  detalleHorariosSocios: any[] = [];

  interPretacionDias: any[] = [
    { id: 0, dia: 'SIN DIA', abrev: '00:00' },
    { id: 1, dia: 'Domingo', abrev: 'Dom' },
    { id: 2, dia: 'Lunes', abrev: 'Lun' },
    { id: 3, dia: 'Martes', abrev: 'Mar' },
    { id: 4, dia: 'Miércoles', abrev: 'Mie' },
    { id: 5, dia: 'Jueves', abrev: 'Jue' },
    { id: 6, dia: 'Viernes', abrev: 'Vie' },
    { id: 7, dia: 'Sábado', abrev: 'Sab' },
  ];

  cambioClaseNuevo(event: any) {
    //Limpiamos todos los arrays cada vez que se cambia la clase.
    this.listaSocios = [];
    this.listaSociosFormato = [];
    this.horariosFiltrados = [];
    this.detalleHorariosSocios = [];

    //Obtenemos el ID de la clase seleccionada
    this.clase = event.target.value;

    //Buscamos la clase seleccionada en el array de clases
    const claseSeleccionada = this.clases.find(
      (clase) => clase.clase == this.clase
    );

    //Si encontramos la clase seleccionada, obtenemos los datos necesarios.
    if (claseSeleccionada) {
      this.listaSocios = claseSeleccionada.listaSocios;
      this.horariosFiltrados = claseSeleccionada.horarios;
      this.detalleHorariosSocios = claseSeleccionada.detalleHorariosSocios;

      // console.log(
      //   'LISTA DE SOSCIOS: ' + JSON.stringify(this.listaSocios, null, 2)
      // );
      // console.log(
      //   'HORARIOS FILTRADOS: ' + JSON.stringify(this.horariosFiltrados, null, 2)
      // );

      //Limpiamos la tabla
      this.dataSource = new MatTableDataSource();

      //Recorremos la lista de socios
      this.listaSocios.forEach((socio) => {
        //Obtenemos el nombre de la clase
        const clase = this.clases.find((clase) => clase.clase == socio.clase);

        //Obtenemos los horarios del socio si es que se repiten en la clase.

        let horario: any;
        // let horario:any = this.horariosFiltrados.filter(
        //   (horario) => horario.id == socio.horario

        // );
        // let horario = this.horariosFiltrados.find(
        //   (horario) => horario.id == socio.horario
        // );

        //Recorremos los horarios filtrados para encontrar LOS HORARIOS DEL SOCIO.
        this.horariosFiltrados.forEach((horarioFiltrado) => {
          if (
            horarioFiltrado.clase == socio.clase &&
            horarioFiltrado.horario == socio.horario &&
            horarioFiltrado.dia == socio.dia
          ) {
            horario = +horarioFiltrado;
          }
        });

        // console.log('HORARIO: ' + JSON.stringify(horario, null, 2));

        //Si no encontramos datos del horario, hacemos el objeto manual para evitar errores.
        if (!horario || horario == undefined || horario == null) {
          horario = {
            dia: '0',
            hora: '0000',
          };
        }

        //Armamos el objeto para la tabla
        const objetoTabla = {
          Clase: clase.nomclase.trim(),
          Horario: `${
            this.interPretacionDias[horario.dia].abrev
          } - ${this.interpretacionHora(horario.hora)}`,
          IDSocio: socio.socio,
          NombreSocio: socio.nomsocio.trim(),
        };

        //Agregamos el objeto a la lista de socios
        this.listaSociosFormato.push(objetoTabla);
      });

      //Asignamos la lista de socios a la tabla
      // console.log(
      //   'LISTA DE SOCIOS: ' + JSON.stringify(this.listaSociosFormato, null, 2)
      // );

      //Asignamos el data, paginador y el ordenador a la tabla.
      this.dataSource = new MatTableDataSource(this.listaSociosFormato);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      //Asignamos los horarios filtrados.
      this.horarios = this.horariosFiltrados;

      // console.log('HORARIOS: ' + JSON.stringify(this.horarios, null, 2));
    } else {
      // console.log('No se encontró la clase seleccionada.');
    }
  }

  sociosFiltradosHorario: any[] = [];
  cambioHorarioNuevo(event: any) {
    //Limpiamos la tabla
    this.dataSource = new MatTableDataSource();
    this.listaSociosFormato = [];


    let id_horario = event.target.value;
    let claseOriginal = this.clase;

    let horarioSeleccionado = this.horariosFiltrados.find(
      (horarioFiltrado) => horarioFiltrado.id == id_horario
    );

    let hora = horarioSeleccionado.hora;
    let dia = horarioSeleccionado.dia;

    let data = {
      clase: claseOriginal,
      id_horario: id_horario,
      dia: dia,
      hora: hora,
    };

    console.log('DATA ENVIAR ALA API: ' + JSON.stringify(data, null, 2));

    this.apiService.getHorariosSocios(data).subscribe((data: any) => {
      console.log('DATA DE LA API: ' + JSON.stringify(data, null, 2));
      this.sociosFiltradosHorario = data;

      //Recorremos la lista de socios filtrados por horario
      this.sociosFiltradosHorario.forEach((socio) => {
        //Obtenemos el nombre de la clase
        const clase = this.clases.find((clase) => clase.clase == socio.clase);

        //Armamos el objeto para la tabla
        const objetoTabla = {
          Clase: clase.nomclase.trim(),
          Horario: `${
            this.interPretacionDias[socio.dia].abrev
          } - ${this.interpretacionHora(socio.hora)}`,
          IDSocio: socio.socio,
          NombreSocio: socio.nomsocio.trim(),
        };

        //Agregamos el objeto a la lista de socios
        this.listaSociosFormato.push(objetoTabla);


      });

       //Asignamos el data, paginador y el ordenador a la tabla.
       this.dataSource = new MatTableDataSource(this.listaSociosFormato);
       this.dataSource.paginator = this.paginator;
       this.dataSource.sort = this.sort;

      console.log(
        'LISTA DE SOCIOS YA FORMATEADOS: ' +
          JSON.stringify(this.listaSociosFormato, null, 2)
      );
    });

  }
}
