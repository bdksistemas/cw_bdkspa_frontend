import { MatTableDataSource } from '@angular/material/table';

/** Suma una columna de las filas visibles (con el filtro de búsqueda aplicado); ignora valores no numéricos. */
export function sumarColumna(ds: MatTableDataSource<any>, columna: string): number {
  const filas = ds.filter ? ds.filteredData : ds.data;
  return filas.reduce((s, r) => s + (Number(r[columna]) || 0), 0);
}
