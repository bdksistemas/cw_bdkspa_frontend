import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiServiceService } from '../../services/api-service.service';
import { sucursalInicial } from '../../auth/auth.service';
import { alCambiarSucursal } from '../../services/sucursal.service';

interface Cita {
  idagenda: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  minutos: number;
  sala: number;
  nomsala: string;
  empleado: number;
  nomempleado: string;
  cliente: string;
  tratamiento: string;
  sesion: number;
  obs: string;
}

interface CitaPos extends Cita {
  inicio: number; // minutos desde las 00:00
  fin: number;
  top: number; // px
  alto: number; // px
  izq: number; // % dentro de la columna del día
  ancho: number; // %
  color: { bg: string; borde: string };
}

interface Dia {
  fecha: string;
  etiqueta: string;
  hoy: boolean;
  citas: CitaPos[];
  columnas: number; // máximo de citas empalmadas (ancho mínimo del día)
}

// Un color por sala (se repite si hay más salas que colores).
const COLORES = [
  { bg: '#e4eee6', borde: '#5f8f6b' },
  { bg: '#f6ecdc', borde: '#c08a3e' },
  { bg: '#e3ecf6', borde: '#4f7fb3' },
  { bg: '#f3e4ec', borde: '#b45c86' },
  { bg: '#ebe4f4', borde: '#7b63ad' },
  { bg: '#e0f0ef', borde: '#4a9a95' },
];

const PX_POR_HORA = 64;
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Agenda semanal de solo lectura: todas las citas de la sucursal, con filtros por sala y empleado. */
@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
})
export class AgendaComponent {
  sucursal: number = sucursalInicial();
  private _alCambiarSucursal = alCambiarSucursal((s) => this.cambioSucusal(s));

  lunes: Date = this.inicioDeSemana(new Date());
  cargando = false;
  error = false;

  citas: Cita[] = [];
  salas: any[] = [];
  empleados: any[] = [];
  horaInicio = '07:00';
  horaFinal = '21:00';

  salaSeleccionada = 0;
  empleadoSeleccionado = 0;
  texto = '';

  dias: Dia[] = [];
  horas: string[] = [];
  altoColumna = 0;
  pxPorHora = PX_POR_HORA;
  total = 0;
  gridCols = '56px repeat(7, minmax(0, 1fr))';
  anchoMin = 760;

  detalle: CitaPos | null = null;

  constructor(private apiService: ApiServiceService) {}

  ngOnInit() {
    this.cargar();
  }

  // ---------- Semana ----------
  get rangoTexto(): string {
    const d = this.diaN(0);
    const f = this.diaN(6);
    const mes = (x: Date) => MESES[x.getMonth()];
    const anio = f.getFullYear();
    return d.getMonth() === f.getMonth()
      ? `${DIAS[d.getDay()]} ${d.getDate()} – ${DIAS[f.getDay()]} ${f.getDate()} ${mes(f)} ${anio}`
      : `${d.getDate()} ${mes(d)} – ${f.getDate()} ${mes(f)} ${anio}`;
  }

  get esSemanaActual(): boolean {
    return this.fmt(this.lunes) === this.fmt(this.inicioDeSemana(new Date()));
  }

  semanaAnterior() {
    this.lunes = this.diaN(-7);
    this.cargar();
  }
  semanaSiguiente() {
    this.lunes = this.diaN(7);
    this.cargar();
  }
  irAHoy() {
    this.lunes = this.inicioDeSemana(new Date());
    this.cargar();
  }

  // ---------- Datos ----------
  private consulta?: Subscription;
  cargar() {
    this.cargando = true;
    this.error = false;
    this.consulta?.unsubscribe();
    this.consulta = this.apiService
      .getAgendaSemana(this.sucursal, this.fmt(this.lunes), this.fmt(this.diaN(6)))
      .subscribe({
        next: (data: any) => {
          this.citas = data.citas ?? [];
          this.salas = data.salas ?? [];
          this.empleados = data.empleados ?? [];
          this.horaInicio = data.horaInicio;
          this.horaFinal = data.horaFinal;
          this.cargando = false;
          this.armar();
        },
        error: () => {
          this.cargando = false;
          this.error = true;
          this.citas = [];
          this.armar();
        },
      });
  }

  cambioSucusal(valor: any) {
    this.sucursal = Number(valor);
    // Salas y empleados son por sucursal: se reinician los filtros.
    this.salaSeleccionada = 0;
    this.empleadoSeleccionado = 0;
    this.texto = '';
    this.cargar();
  }

  // ---------- Filtros ----------
  cambioSala(event: any) {
    this.salaSeleccionada = Number(event.target.value);
    this.armar();
  }
  cambioEmpleado(event: any) {
    this.empleadoSeleccionado = Number(event.target.value);
    this.armar();
  }
  cambioTexto(event: any) {
    this.texto = event.target.value;
    this.armar();
  }

  // ---------- Armado del calendario ----------
  private armar() {
    const q = this.texto.trim().toLowerCase();
    const visibles = this.citas.filter(
      (c) =>
        (!this.salaSeleccionada || c.sala === this.salaSeleccionada) &&
        (!this.empleadoSeleccionado || c.empleado === this.empleadoSeleccionado) &&
        (!q || c.cliente.toLowerCase().includes(q) || c.tratamiento.toLowerCase().includes(q))
    );
    this.total = visibles.length;

    // Las filas cubren el horario de la sucursal y, si hace falta, las citas fuera de él.
    let ini = this.aMinutos(this.horaInicio);
    let fin = this.aMinutos(this.horaFinal);
    for (const c of this.citas) {
      ini = Math.min(ini, this.aMinutos(c.hora));
      fin = Math.max(fin, this.aMinutos(c.hora) + c.minutos);
    }
    const desde = Math.floor(ini / 60) * 60;
    const hasta = Math.ceil(fin / 60) * 60;
    this.horas = [];
    for (let m = desde; m < hasta; m += 60) this.horas.push(this.hhmm(m));
    this.altoColumna = ((hasta - desde) / 60) * PX_POR_HORA;

    const hoy = this.fmt(new Date());
    this.dias = [];
    for (let i = 0; i < 7; i++) {
      const d = this.diaN(i);
      const fecha = this.fmt(d);
      const delDia: CitaPos[] = visibles
        .filter((c) => c.fecha === fecha)
        .map((c) => {
          const inicio = this.aMinutos(c.hora);
          const idx = Math.max(0, this.salas.findIndex((s) => s.sala === c.sala));
          return {
            ...c,
            inicio,
            fin: inicio + c.minutos,
            top: ((inicio - desde) / 60) * PX_POR_HORA,
            alto: Math.max((c.minutos / 60) * PX_POR_HORA, 22),
            izq: 0,
            ancho: 100,
            color: COLORES[idx % COLORES.length],
          };
        });
      const columnas = this.repartir(delDia);
      this.dias.push({ fecha, etiqueta: `${DIAS[d.getDay()]} ${d.getDate()}`, hoy: fecha === hoy, citas: delDia, columnas });
    }
    // Un día con citas empalmadas se ensancha para que cada tarjeta siga siendo legible.
    const minimos = this.dias.map((d) => Math.max(110, d.columnas * 96));
    this.gridCols = '56px ' + minimos.map((m) => `minmax(${m}px, 1fr)`).join(' ');
    this.anchoMin = 56 + minimos.reduce((a, b) => a + b, 0);
  }

  // Citas que se empalman en el tiempo se reparten lado a lado dentro de la columna del día.
  private repartir(citas: CitaPos[]): number {
    let maxCols = 1;
    citas.sort((a, b) => a.inicio - b.inicio || a.fin - b.fin);
    let grupo: CitaPos[] = [];
    let finGrupo = -1;
    const cerrar = () => {
      const cols: number[] = []; // fin de la última cita de cada columna
      const col = new Map<CitaPos, number>();
      for (const c of grupo) {
        let k = cols.findIndex((f) => f <= c.inicio);
        if (k === -1) k = cols.length;
        cols[k] = c.fin;
        col.set(c, k);
      }
      maxCols = Math.max(maxCols, cols.length);
      for (const c of grupo) {
        c.ancho = 100 / cols.length;
        c.izq = (col.get(c) as number) * c.ancho;
      }
      grupo = [];
    };
    for (const c of citas) {
      if (grupo.length && c.inicio >= finGrupo) {
        cerrar();
        finGrupo = -1;
      }
      grupo.push(c);
      finGrupo = Math.max(finGrupo, c.fin);
    }
    if (grupo.length) cerrar();
    return maxCols;
  }

  // ---------- Detalle (solo lectura) ----------
  abrir(c: CitaPos) {
    this.detalle = c;
  }
  @HostListener('document:keydown.escape')
  cerrar() {
    this.detalle = null;
  }

  rangoHora(c: Cita): string {
    return `${c.hora}–${this.hhmm(this.aMinutos(c.hora) + c.minutos)}`;
  }
  fechaLarga(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ---------- Utilidades de fecha ----------
  private inicioDeSemana(d: Date): Date {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); // lunes
    return r;
  }
  private diaN(n: number): Date {
    return new Date(this.lunes.getFullYear(), this.lunes.getMonth(), this.lunes.getDate() + n);
  }
  private fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  private aMinutos(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
  private hhmm(min: number): string {
    return `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  }
}
