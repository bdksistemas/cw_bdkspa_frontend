import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService  {

  private dominio= environment.DOMINIO_API_LOCAL;
  constructor(private http:HttpClient) {

  }

  // Headers armados en cada petición: el token se lee al momento (antes se leía una vez al crear el servicio,
  // o sea antes del login) y se le quitan las comillas con que se guarda en localStorage.
  // Las credenciales de BD ya no viajan: el backend las resuelve en el servidor con el idcw del token.
  get httpOptions(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (localStorage.getItem('token')?.replace(/['"]+/g, '') ?? ''),
    });
  }

  // Se conserva porque los métodos la llaman; el getter httpOptions ya arma los headers.
  setHeaders(){}

  getInitialData($sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){
    this.setHeaders();
    let url = 'dashboard/datosDashboard'
    let data = {
      'id_usuario': $usuario,
      'sucursal': $sucursal
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getReporteTickets($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, categoria:any =null ,$usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'rtickets/obtenerRegistrosTickets'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'id_usuario': $usuario,
      'sucursal': $sucursal,
      'categoria': categoria,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getReporteIngresos($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, tratamiento:any=null, empleado:any=null){
    let url = 'rtickets/ingresos'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'sucursal': $sucursal,
      'tratamiento': tratamiento,
      'empleado': empleado

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getReporteVentasDetalle($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $cajero: any = null){
    let url = 'rtickets/obtenerRegistroVentasDetallado'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'cajero': $cajero,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getReporteVentasProducto($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $categoria=0 ,$usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'rventas/getVentasProducto'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'id_usuario': $usuario,
      'sucursal': $sucursal,
      'categoria': $categoria

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getReporteVentasCategoria($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $categoria=1 ,$usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'rventas/getVentasCategoria'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'id_usuario': $usuario,
      'sucursal': $sucursal,
      'categoria': $categoria

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }


  getReporteAlmacenExistencias($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $categoria:number =0, $usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'ralmacen/getExistencias'
    let data = {
      'sucursal': $sucursal,
      'categoria': $categoria,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getEntradasAlmacen($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, provedor:any=0){
    let url = 'ralmacen/getEntradasAlmacen'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'provedor': provedor,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }
  getCobroMembresias($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, tmovimiento: any = null, tsuscripcion: any = null){

    //! 999 es igual a TODOS, para que no entre nignun filtro.

    let url = 'rtickets/cobro-membresias'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'sucursal': $sucursal,
      'tmovimiento': tmovimiento,
      'tsuscripcion': tsuscripcion,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }
  getSalidasAlmacen($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'ralmacen/getSalidasAlmacen'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      // 'id_usuario': $usuario,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getAlmacenOrdenesCompra($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, provedor:any=null, estatus:any=null){
    let url = 'ralmacen/getAlmacenOrdenesCompra'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'provedor': provedor,
      'sucursal': $sucursal,
      'estatus': estatus

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getGastos($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, concepto:any =0, provedor:any =0, tmovimiento:any =null){
    let url = 'ralmacen/getGastos'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'sucursal': $sucursal,
      'concepto': concepto,
      'proveedor': provedor,
      'producto': tmovimiento

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }
  getSalidasEfectivo($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $cajero:any =0){
    let url = 'ralmacen/getSalidasEfectivo'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'cajero': $cajero,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }


  getCategorias(sucursal:any){
    let url = 'general/getCategorias'
    let data = {
      'sucursal': sucursal,
    }

    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }
  getCategoriasCliente(sucursal:any){
    let url = 'general/getCategoriasCliente'
    let data = {
      'sucursal': sucursal,
    }

    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }




  getTipoSuscripcion(sucursal:any){

    let url = 'general/getTipoSuscripcion'
    let data = {
      'sucursal': sucursal,
    }

    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getCajeros(sucursal:any){

    let url = 'general/getCajeros'
    let data = {
      'sucursal': sucursal,
    }

    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }



  //Suscripciones vencidas:



  getListaSociosActivos($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, categoria:number =0){
    let url = 'rsocios/getListaSociosActivos'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'categoria': categoria,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getVentasCredito($fechaInicial:any =null, $fechaFinal:any =null, $sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'rventas/getVentasCredito'
    let data = {
      'fecha_inicial': $fechaInicial,
      'fecha_final': $fechaFinal,
      'id_usuario': $usuario,
      'sucursal': $sucursal,

    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }



  obtenerBannerPublicitario(){
   let url = 'https://www.apiweb.servidorbdk.com/tbbannerspub?select=idbanner,descripcion,banner,linkweb'
    return this.http.get(`${url}`)
  }


  getProveedores( $sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){

    let url = 'general/getProveedores'

    let data = {
      'id_usuario': $usuario,
      'sucursal': $sucursal,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getConceptos( $sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){

    let url = 'general/getConceptos'

    let data = {
      'id_usuario': $usuario,
      'sucursal': $sucursal,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getTratamientosSalas( $sucursal: number = 1, $usuario: string = localStorage.getItem('id_usuario')!){
    let url = 'dashboard/tratamientosSalas'

    let data = {
      'id_usuario': $usuario,
      'sucursal': $sucursal,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }


  getAgendaGeneral(fechaInicial:any = null, fechaFinal:any= null,sucursal:any = 1,  sala:any= null,usuario:any = null){
    let url = 'rtickets/agendaGeneral'
    let data = {
      'sucursal': sucursal,
      'fecha_inicial': fechaInicial,
      'fecha_final': fechaFinal,
      'sala': sala,
      'id_usuario': usuario,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})

  }
  //Agenda Por Sala:
  getAgendaSala(sucursal:any = 1, fechaInicial:any = null, fechaFinal:any= null, sala:any= null,usuario:any = null){
    let url = 'rtickets/agendaPorSala'
    let data = {
      'sucursal': sucursal,
      'fecha_inicial': fechaInicial,
      'fecha_final': fechaFinal,
      'sala': sala,
      'id_usuario': usuario,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})

  }

  //Agenda por Empleado:
  getAgendaEmpleado(sucursal:any = 1, fechaInicial:any = null, fechaFinal:any= null, sala:any= null,usuario:any = null){
    let url = 'rtickets/agendaEmpleado'
    let data = {
      'sucursal': sucursal,
      'fecha_inicial': fechaInicial,
      'fecha_final': fechaFinal,
      'empleado': usuario,
      'id_usuario': usuario,
      'sala': sala
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})

  }

  getTipoTratamiento(sucursal:any =1){
    let url = 'general/getTipoTratamientos'
    let data = {
      'sucursal': sucursal,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getEstatus(sucursal:any =1){
    let url = 'general/getEstatus'
    let data = {
      'sucursal': sucursal,
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }

  getSalas(sucursal:any =1, fechaInicial:any = null){
    let url = 'general/obtenerSalas'
    let data = {
      'sucursal': sucursal,
      'fecha_inicial': fechaInicial
    }
    return this.http.post(`${this.dominio}${url}`, data, {headers: this.httpOptions})
  }





}
