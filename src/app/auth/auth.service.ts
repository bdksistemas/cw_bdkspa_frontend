import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { Usuarios } from '../interfaces/usuarios.interface';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { Licencia } from '../interfaces/Licencia';
import jwt_decode, { jwtDecode } from 'jwt-decode'; // Importa la librería jwt-decode para decodificar tokens JWT

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  //  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  //  private dominio = URL_SERVICIOS;
  private dominio = environment.DOMINIO_API_LOCAL;

  // public fields
  currentUser$: Observable<any>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<any>;
  isLoadingSubject: BehaviorSubject<boolean>;

  //Cremos los headers para las peticiones
  httpOptions = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Allow-Control-Allow-Origin': '*',
  });

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }

  token: any = null;
  user: any = null;

  constructor(
    private router: Router,
    private HttpClient: HttpClient
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<any>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(data:any): Observable<any> {


    // let url = this.dominio + '/auth/login';
     let url = environment.DOMINIO_API_LOGIN;
    // let url = 'http://127.0.0.1:8000/api/auth/login'

    // let data = {
    //   email: email,
    //   password: password,
    // };

    this.isLoadingSubject.next(true);
    return this.HttpClient.post(url, data).pipe(
      map((auth: any) => {

        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      // switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    //Limpiamos tambien la sesion:
    sessionStorage.clear();
    localStorage.clear();

    setTimeout(() => {
        window.location.reload();
    }, 500);

    this.router.navigate(['/login'], {
      queryParams: {},
    });

  }

  getUserByToken(): Observable<any> {

    const auth = this.getAuthFromLocalStorage();
    if (!auth) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return of(auth).pipe(
      map((user: any) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

   licencias: any[] = [];

  // private methods
  private setAuthFromLocalStorage(auth: any): boolean {

    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.token) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      localStorage.setItem('token', JSON.stringify(auth.token));
      localStorage.setItem('licencias', JSON.stringify(auth.licencias));

      //Variables para identificar el usuario logeado.
      localStorage.setItem('cliente', auth.user.cliente);
      localStorage.setItem('software', auth.user.software);
      localStorage.setItem('nom_cw', auth.user.nom_cw);

      //Variables para la base de datos.
      sessionStorage.setItem('hosting', auth.user.hosting);
      sessionStorage.setItem('bd_nombre', auth.user.bd_nombre);
      sessionStorage.setItem('bd_user', auth.user.bd_user);
      sessionStorage.setItem('bd_psw', auth.user.bd_psw);

      //Variables para la licencia. (Primero verificamos si existen licencias)
      if (auth.licencias) {
        //Recorremos las licencias para obtener los datos y los mostramos en consola.

        auth.licencias.forEach((element: Licencia) => {

          this.licencias.push(element);

        });

        // console.log('Licencias: ', this.licencias);
      }


      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): any | undefined {
    try {
      const lsValue = localStorage.getItem('user');
      if (!lsValue) {
        return undefined;
      }
      this.token = localStorage.getItem('token');

      this.user = JSON.parse(lsValue);
      const authData = this.user;
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  //Regresamos las licencias.
  getLicencias() {
    return this.licencias.length !== 0 ? this.licencias : undefined;
  }
  setLicencias(){

    if (this.licencias.length == 0) {
      //Recorremos las licencias para obtener los datos y los mostramos en consola.
      let auth:any = JSON.parse(localStorage.getItem('licencias')!);
      this.licencias = auth;
      return auth;
    }else{
      return this.licencias;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token'); // Obtener el token almacenado localmente
    if (token) {
      try {

        const tokenPayload = jwtDecode(token)// Decodificar el token JWT
        const now = Date.now().valueOf() / 1000; // Obtener la fecha y hora actual en segundos

        // Verificar si el token ha caducado
        if (tokenPayload.exp && tokenPayload.exp < now) {
          console.error('TKN expirado: ', tokenPayload.exp, ' < ', now, ' = ', tokenPayload.exp < now);
          return false; // El token ha caducado
        }

        // Verificar si el token ha sido alterado (comprobando la firma, si corresponde)
        // Puedes agregar lógica adicional aquí según tus necesidades de seguridad

        // Si el token no ha caducado y no ha sido alterado, consideramos que el usuario está autenticado
        return true;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return false; // Error al decodificar el token
      }
    } else {
      return false; // Si no hay ningún token almacenado, se considera que el usuario no está autenticado
    }
  }
}
