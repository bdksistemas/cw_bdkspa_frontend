import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable()
export class MyInterceptor implements HttpInterceptor {

  constructor(private _ngxUiLoaderService: NgxUiLoaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Aquí puedes realizar modificaciones a la solicitud antes de enviarla
    // Por ejemplo, agregar encabezados personalizados
    // const modifiedRequest = request.clone({
    //   setHeaders: {
    //     Authorization: `Bearer ${localStorage.getItem('token')!}`
    //   }
    // });

    // Continuar con la solicitud modificada
    //return next.handle(modifiedRequest);

    this._ngxUiLoaderService.start();
        return next.handle(request).pipe(
          finalize(() => {
            this._ngxUiLoaderService.stop();
          })
        );
  }
}
