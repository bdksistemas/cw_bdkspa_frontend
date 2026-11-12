import { AfterViewInit, Component, NgZone, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Chart } from 'chart.js';
import { ApiServiceService } from '../../services/api-service.service';
import { DdatosIniciales } from '../../interfaces/DdatosIniciales';
import { sucursalInicial } from '../../auth/auth.service';
import { alCambiarSucursal } from '../../services/sucursal.service';
const salesData = [10, 20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65];

// jQuery y moment se cargan como scripts globales (angular.json); el selector de fechas es el plugin daterangepicker.
declare const $: any;
declare const moment: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false,
  encapsulation: ViewEncapsulation.None, // Permite que los estilos de ANGULAR MATERIAL se apliquen correctamente DESDE NUESTRO CSS
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  chart: Chart | undefined;
  barChart: Chart | undefined;
  lineChart: Chart | undefined;
  top10Products: Chart | undefined;
  doughnutChart: Chart | undefined | any;

  tratamientoSala: Chart | undefined | any;


  serviciosPorEmpleado: any;
  serviciosPorEmpleadoData: any;

  top10Productsdata:any;
  ventasCategoriaData:any;
  citasData: any;
  cuentasAbiertasData: any;
  ventasCategoria: any;

  tratamientosActivos: any;
  serieVentas: any;

  datosIniciales: DdatosIniciales = {} as DdatosIniciales;
  tratamientosData: any;

  // Periodo de las tarjetas y gráficas que dependen de él (por defecto HOY).
  sucursal: any = sucursalInicial();
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));
  fechaInicial: string = moment().format('YYYY-MM-DD');
  fechaFinal: string = moment().format('YYYY-MM-DD');
  etiquetaPeriodo: string = 'Hoy';
  agrupacionVentas: string = 'hora';

  constructor(
    private apiService: ApiServiceService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.getInitialData(this.sucursal);
    }, 500);
  }

  ngAfterViewInit(): void {
    moment.locale('es');
    const ayer = moment().subtract(1, 'days');
    $('#rangoFechas').daterangepicker(
      {
        startDate: moment(),
        endDate: moment(),
        maxDate: moment(),
        opens: 'left',
        alwaysShowCalendars: true,
        ranges: {
          'Hoy': [moment(), moment()],
          'Ayer': [ayer, ayer],
          'Últimos 7 días': [moment().subtract(6, 'days'), moment()],
          'Últimos 30 días': [moment().subtract(29, 'days'), moment()],
          'Este mes': [moment().startOf('month'), moment()],
          'El mes pasado': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
        },
        locale: {
          format: 'DD/MM/YYYY',
          separator: ' - ',
          applyLabel: 'Actualizar',
          cancelLabel: 'Cancelar',
          customRangeLabel: 'Personalizado',
          daysOfWeek: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          monthNames: moment.months(),
          firstDay: 1,
        },
      },
      (inicio: any, fin: any, etiqueta: string) => {
        // El plugin llama fuera de la zona de Angular.
        this.zone.run(() => this.cambioFechas(inicio, fin, etiqueta));
      }
    );
  }

  ngOnDestroy(): void {
    $('#rangoFechas').data('daterangepicker')?.remove();
  }

  // Título de la gráfica de ventas según cómo agrupa el backend: 1 día = por hora, hasta 31 días = por día, más = por mes.
  get tituloVentas(): string {
    const titulos: any = { hora: 'VENTAS POR HORA', dia: 'VENTAS POR DÍA', mes: 'VENTAS POR MES' };
    return titulos[this.agrupacionVentas] ?? 'VENTAS';
  }

  cambioFechas(inicio: any, fin: any, etiqueta: string) {
    this.fechaInicial = inicio.format('YYYY-MM-DD');
    this.fechaFinal = fin.format('YYYY-MM-DD');
    this.etiquetaPeriodo =
      etiqueta === 'Personalizado' ? inicio.format('DD/MM/YYYY') + ' - ' + fin.format('DD/MM/YYYY') : etiqueta;

    // El periodo alimenta tarjetas y gráficas: se recarga todo el dashboard.
    this.getInitialData(this.sucursal);
  }
  // El backend entrega horas.minutos (519.58 = 519 h 58 min), no horas decimales.
  tiempoAbierto(valor: any): string {
    const [h, m] = Number(valor).toFixed(2).split('.').map(Number);
    return (h > 0 ? h + ' h ' : '') + m + ' min abierta';
  }

  cambioSucusal(valor: any) {
    this.sucursal = Number(valor);
    this.getInitialData(this.sucursal);
  }

  getInitialData(sucursal:any) {
    //Vaciamos todas las graficas para volver a cargarlas.



    this.sucursal = sucursal;

    this.apiService.getInitialData(sucursal, this.fechaInicial, this.fechaFinal).subscribe((res: any) => {

      // console.log(res);
      this.datosIniciales = res.data.datosIniciales;

      this.tratamientosActivos = res.data.tratamientosActivos;
      this.graficaTratamientosActivos();

      this.serieVentas = res.data.serieVentas;
      this.agrupacionVentas = res.data.agrupacionVentas;
      this.graficaSerieVentas();

      this.citasData = res.data.citasPeriodo;

      this.top10Productsdata = res.data.topProductos;
      this.graficaTop10Productos();

      this.ventasCategoriaData = res.data.ventasPorCategorias;
      this.graficaVentasPorCategoria();


      this.cuentasAbiertasData = res.data.cuentasAbiertas;


      this.tratamientosData = res.data.tratamientosSalas;
      this.graficaTratamientos();

      this.serviciosPorEmpleadoData = res.data.serviciosPorEmpleado;
      this.graficaServiciosPorEmpleado();

    });
  }
  graficaTratamientos(){
    let labels: any[] = [];
    let data: any[] = [];

    this.tratamientosData.forEach((tratamiento: any) => {
      labels.push(tratamiento.nombresala + ' ' + `(${tratamiento.cantidad})`);
      data.push(tratamiento.cantidad);
    });

    if (this.tratamientoSala) {
      this.tratamientoSala.destroy();
    }

    this.tratamientoSala = new Chart('tratamientoSala', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad de tratamientos por sala',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            beginAtZero: true,
            // ticks: {
            //   callback: function (value) {
            //     return value.toLocaleString('es-MX', {
            //       style: 'currency',
            //       currency: 'MXN',
            //     });
            //   },
            // },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x', // Organizar los datos a lo largo del eje y
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context: any) {
                return context.dataset.label + ': ' + context.formattedValue;
              },
            },
          },
        },
      },
    });
  }
  graficaServiciosPorEmpleado() {
    let labels: any[] = [];
    let data: any[] = [];

    try {
      this.serviciosPorEmpleadoData.forEach((empleado: any) => {
        labels.push(empleado.nombre.trim() + ' ' + `(${empleado.total_tratamientos})`);
        data.push(empleado.total_tratamientos);
      });
      if (this.serviciosPorEmpleado) {
        this.serviciosPorEmpleado.destroy();
      }
      this.serviciosPorEmpleado = new Chart('serviciosPorEmpleado', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Servicios Empleados',
              data: data,
              backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
              ],

              borderWidth: 1,
            },
          ],
        },
        options: {
          maintainAspectRatio: false, // Permite un mejor ajuste en pantallas pequeñas
          responsive: true, // Permite que la gráfica se ajuste al tamaño del contenedor
          plugins: {
            legend: {
              position: 'bottom', // Coloca la leyenda a la derecha
              labels: {
                font: {
                  //size: this.fontSize// Tamaño de la fuente de la leyenda
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: false,
                text: 'Ventas',
              },
              ticks: {
                callback: function (value) {
                  return value.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  });
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Ventas',
              },
            },
          },
        },
      });
    } catch (error) {
      // console.log('Error al cargar la grafica de servicios por empleado');
      // console.log(error);

      //Creamos una grafica con datos de prueba.
      this.serviciosPorEmpleado = new Chart('serviciosPorEmpleado', {
        type: 'bar',
        data: {
          labels: ['PRUEBA 1', 'PRUEBA 2', 'PRUEBA 3', 'PRUEBA 4', 'PRUEBA 5'],
          datasets: [
            {
              label: 'Servicio Empleado',
              data: [1, 2, 3, 4, 5],
              backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
              ],

              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom', // Coloca la leyenda a la derecha
              labels: {
                font: {
                  //size: this.fontSize// Tamaño de la fuente de la leyenda
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Servicio',
              },
              ticks: {
                callback: function (value) {
                  return value.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  });
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Empleado',
              },
            },
          },
        },
      });
    }
  }

  graficaVentasPorCategoria() {
    let labels: any[] = [];
    let data: any[] = [];

    this.ventasCategoriaData.forEach((categoria: any) => {
      labels.push(
        categoria.nomcategoria + ' ' + '(' + categoria.cantidad + ')'
      );
      data.push(categoria.total);
    });
    if (this.ventasCategoria) {
      this.ventasCategoria.destroy();
    }

    this.ventasCategoria = new Chart('ventasCategoria', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total de ventas por categoría $',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false, // Permite un mejor ajuste en pantallas pequeñas
        responsive: true, // Permite que la gráfica se ajuste al tamaño del contenedor
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                });
              },
            },
          },
        },
      },
    });
  }

  graficaTop10Productos() {
    const nombresCompletos: string[] = [];
    let labels: any[] = [];
    let data: any[] = [];


    if ( this.top10Productsdata[0]==undefined  || this.top10Productsdata == undefined) {
      // console.log('NO HAY DATA');
      labels.push('NO HAY DATA');
      data.push(0);
    }else{
      this.top10Productsdata.forEach((producto: any) => {


        nombresCompletos.push(producto.nomproducto);
        const n = String(producto.nomproducto);
        labels.push((n.length > 22 ? n.slice(0, 21) + '…' : n) + ` (${producto.total_producto_vendido})`);
        data.push(producto.total_producto_vendido);
      });

    }

    if (this.top10Products) {
      this.top10Products.destroy();
    }

    this.top10Products = new Chart('top10Products', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad vendida',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: true
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            // ticks: {
            //   callback: function (value) {
            //     return value.toLocaleString('es-MX', {
            //       style: 'currency',
            //       currency: 'MXN',
            //     });
            //   },
            // },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Organizar los datos a lo largo del eje y
        plugins: {
          tooltip: {
            callbacks: {
              title: (items: any[]) => nombresCompletos[items[0].dataIndex] ?? items[0].label,
              label: function (context: any) {
                return context.dataset.label + ': ' + context.formattedValue;
              },
            },
          },
        },
      },
    });
  }

  graficaSerieVentas() {
    let labels: any[] = [];
    let data: any[] = [];

    this.serieVentas.forEach((punto: any) => {
      labels.push(punto.fecha);
      data.push(punto.ventas);
    });

    if(this.chart != undefined){
      this.chart.destroy();
    }

    // Obtener la cantidad de etiquetas (labels)
    var numLabels = labels.length;

    // Crear un array para almacenar los colores
    var backgroundColors = [];

    // Generar un color aleatorio para cada etiqueta
    for (var i = 0; i < numLabels; i++) {
      var color = this.getRandomColor(0.7); // Alpha = 0.7 para darle transparencia
      backgroundColors.push(color);
    }

    this.chart = new Chart('serieVentas', {
      type: 'bar',
      data: {
        // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        labels: labels,
        datasets: [
          {
            label: 'Total de ventas:',
            // data: [12, 19, 3, 5, 2, 3],
            data: data,
            // backgroundColor: backgroundColors,
            backgroundColor: [
              'rgba(40, 167, 69, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false, // Permite un mejor ajuste en pantallas pequeñas
        responsive: true, // Permite que la gráfica se ajuste al tamaño del contenedor
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                });
              },
            },
          },
        },
      },
    });
  }

  graficaTratamientosActivos() {
    // console.log('ESTO SON LAS MESAS OCUPADAS '+ this.tratamientosActivos);
    let labels: any[] = [];
    let data: any[] = [];
    this.tratamientosActivos.forEach((element:any) => {
      labels.push(element.nomproducto + ' ' + `(${element.total})`);
      data.push(element.total);
    });


    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }

    this.doughnutChart = new Chart('doughnutChart', {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tratamientos activos',
            data: data,
            backgroundColor: [
              'rgba(224, 22, 22, 1.00)',
              'rgba(54, 162, 235, 1.00)',
              'rgba(255, 206, 86, 1.00)',
              'rgba(75, 192, 192, 1.00)',
              'rgba(153, 102, 255, 1.00)',
              'rgba(255, 159, 64, 1.00)',
            ],
            borderWidth: 1,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom', // Coloca la leyenda a la derecha
            align: 'start', // Alinea las etiquetas al inicio (izquierda)
            labels: {
              font: {
                size: this.fontSize, // Tamaño de la fuente de la leyenda
              },
              usePointStyle: true, // Usa un estilo de punto más pequeño en las leyendas
              boxWidth: 10, // Ajusta el ancho de los cuadros si es necesario
            },
            
          },
        },
      },
    });

    const legendElement = document.querySelector("#doughnutChart + .chart-legend");
    if (legendElement) {
      legendElement.classList.add('legend-container');
    }

  }

  toggleCollapse(cardId: string) {
    const card = document.getElementById(cardId);
    if (card) {
      card.classList.toggle('collapsed');
    }
  }

  calculateFontSize(): number {
    const windowWidth = window.innerWidth;

    if (windowWidth < 768) {
      return 12; // Tamaño de fuente para pantallas pequeñas
    }else if (windowWidth < 568) {
      return 10; // Tamaño de fuente para pantallas pequeñas
    }
    else if (windowWidth < 1024) {
      return 14; // Tamaño de fuente para pantallas medianas
    } else {
      return 14; // Tamaño de fuente para pantallas grandes
    }
  }

  // Función para generar un color aleatorio en formato rgba
  getRandomColor(alpha: any) {
    // Genera valores aleatorios para cada componente RGB
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    // Retorna el color en formato rgba
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Obtener el tamaño de fuente calculado
  fontSize: number = this.calculateFontSize();
}
