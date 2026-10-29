import { Component, ViewEncapsulation } from '@angular/core';
import { Chart } from 'chart.js';
import { ApiServiceService } from '../../services/api-service.service';
import { DdatosIniciales } from '../../interfaces/DdatosIniciales';
import { Licencia } from '../../interfaces/Licencia';
import { AuthService } from '../../auth/auth.service';
const salesData = [10, 20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false,
  encapsulation: ViewEncapsulation.None, // Permite que los estilos de ANGULAR MATERIAL se apliquen correctamente DESDE NUESTRO CSS
})
export class DashboardComponent {
  chart: Chart | undefined;
  barChart: Chart | undefined;
  lineChart: Chart | undefined;
  top10Products: Chart | undefined;
  asistenciasHoraChart: Chart | undefined;
  metodosDePago: Chart | undefined | any;
  doughnutChart: Chart | undefined | any;

  tratamientoSala: Chart | undefined | any;


  sociosPorClase: any;
  sociosPorClaseoData: any;

  top10Productsdata:any;
  ventasCategoriaData:any;
  asistenciasHoraData: any;
  metodosDePagoData: any;
  ventasCategoria: any;

  sociosActivos: any;
  inscripcionesDiarias: any;

  datosIniciales: DdatosIniciales = {} as DdatosIniciales;
  tratamientosData: any;

  constructor(
    private apiService: ApiServiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.obtenerSucursales();
      this.getInitialData(1);
    }, 500);
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

    let sucursal = event.target.value;
    this.getInitialData(sucursal)
  }

  getInitialData(sucursal:any) {
    //Vaciamos todas las graficas para volver a cargarlas.



    this.apiService.getInitialData(sucursal).subscribe((res: any) => {

      // console.log(res);
      this.datosIniciales = res.data.datosIniciales;

      this.sociosActivos = res.data.sociosActivos;
      this.graficaSociosActivos();

      this.inscripcionesDiarias = res.data.inscripcionesDiarias;
      this.graficaInscripcionesAbiertas();

      this.asistenciasHoraData = res.data.asistenciasHoraDiaria;
      // this.graficaAsistenciaPorHora();

      this.top10Productsdata = res.data.topProductos;
      this.graficaTop10Productos();

      this.ventasCategoriaData = res.data.ventasPorCategorias;
      this.graficaVentasPorCategoria();


      this.metodosDePagoData = res.data.formasDePago;
      // this.graficaMetodosDePago();


      this.tratamientosData = res.data.tratamientosSalas;
      this.graficaTratamientos();

      this.sociosPorClaseoData = res.data.sociosPorClase;
      this.graficaSociosPorClase();

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
  graficaSociosPorClase() {
    let labels: any[] = [];
    let data: any[] = [];

    try {
      this.sociosPorClaseoData.forEach((mesero: any) => {
        labels.push(mesero.nombre.trim() + ' ' + `(${mesero.total_tratamientos})`);
        data.push(mesero.total_tratamientos);
      });
      if (this.sociosPorClase) {
        this.sociosPorClase.destroy();
      }
      this.sociosPorClase = new Chart('sociosPorClase', {
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
      // console.log('Error al cargar la grafica de ventas por mesero');
      // console.log(error);

      //Creamos una grafica con datos de prueba.
      this.sociosPorClase = new Chart('sociosPorClase', {
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
    let labels: any[] = [];
    let data: any[] = [];


    if ( this.top10Productsdata[0]==undefined  || this.top10Productsdata == undefined) {
      // console.log('NO HAY DATA');
      labels.push('NO HAY DATA');
      data.push(0);
    }else{
      this.top10Productsdata.forEach((producto: any) => {


        labels.push(producto.nomproducto + ' ' + `(${producto.total_producto_vendido})`);
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
              label: function (context: any) {
                return context.dataset.label + ': ' + context.formattedValue;
              },
            },
          },
        },
      },
    });
  }

  graficaInscripcionesAbiertas() {
    let labels: any[] = [];
    let data: any[] = [];

    this.inscripcionesDiarias.forEach((inscripcion: any) => {
      labels.push(inscripcion.fecha);
      data.push(inscripcion.inscripciones);
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

    this.chart = new Chart('inscripcionesDiarias', {
      type: 'bar',
      data: {
        // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        labels: labels,
        datasets: [
          {
            label: 'Total de ventas diarias:',
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

  graficaAsistenciaPorHora() {

    // console.log('ESTO SON LAS VENTAS POR HORA '+ this.ventasPorHora);
    let labels: any[] = [];
    let data: any[] = [];

    this.asistenciasHoraData.forEach((asistencia: any) => {
      labels.push(asistencia.hora);
      data.push(asistencia.total);
    });

    if (this.asistenciasHoraChart) {
      this.asistenciasHoraChart.destroy();
  }

    this.asistenciasHoraChart = new Chart('asistenciasHoraChart', {
      type: 'bar',
      data: {
        labels: labels,
        //labels: Array.from({ length: 14 }, (_, i) => `${i + 1} AM`), // Etiquetas para las horas del día
        datasets: [
          {
            label: 'Asistencias por hora:',
            data: data, // Tus datos de ventas por hora
            backgroundColor: 'rgba(0, 123, 255, 1)', // Color de las barras
            borderColor: 'rgba(54, 162, 235, 1)', // Color del borde de las barras
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Empezar el eje y en 0
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

  graficaSociosActivos() {
    // console.log('ESTO SON LAS MESAS OCUPADAS '+ this.sociosActivos);
    let labels: any[] = [];
    let data: any[] = [];
    this.sociosActivos.forEach((element:any) => {
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
            label: '# de Mesas',
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
        responsive: false,
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

  graficaMetodosDePago() {
    let labelsmetodosDePago: any = [];
    let datametodosDePago: any = [];

    if(this.metodosDePago){
      this.metodosDePago.destroy();
    }

    this.metodosDePagoData.forEach((metodo: any) => {
      labelsmetodosDePago.push(metodo.FormaDePago);
      datametodosDePago.push(metodo.Importe);
    });
    //Calculamos el valor mas alto para mostrarlo en el titulo
    let maxLabel =
      labelsmetodosDePago[
        datametodosDePago.indexOf(Math.max(...datametodosDePago))
      ];


    this.metodosDePago = new Chart('metodosDePago', {
      type: 'doughnut',
      data: {
        labels: labelsmetodosDePago,
        datasets: [
          {
            data: datametodosDePago,
            //Creamos un array de colores para cada una de las barras, segun la cantidad de datos.
            backgroundColor: [
              'rgba(236, 110, 6, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(255, 99, 132, 0.7)',
            ],
            borderWidth: 1,
            label: 'Metodos de pago',
          },
        ],
      },
      options: {
        // scales: {
        //   y: {
        //     beginAtZero: true,
        //     ticks: {
        //       callback: function(value) {
        //           return value.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});
        //       }
        //   }
        //   }
        // },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },

          title: {
            display: true,
            text: maxLabel,
            position: 'bottom',
          },
        },
      },
    });


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
