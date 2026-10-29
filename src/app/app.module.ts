import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { NopageFoundComponent } from './nopage-found/nopage-found.component';
import { PagesModule } from './pages/pages.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MaterialModule } from './material/material.module';
import { PrimengModule } from './material/primeng.module';
import { ToastrModule } from 'ngx-toastr';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { MyInterceptor } from './interceptors/interceptor-api';
import { AuthService } from './auth/auth.service';

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      // console.log('APP INITIALIZER');
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}
@NgModule({
  declarations: [
    AppComponent,
    NopageFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PagesModule,
    AuthModule,
    HttpClientModule,
    MaterialModule,
    PrimengModule,
    NgxUiLoaderModule,
    ToastrModule.forRoot()

  ],
  providers: [
    provideAnimationsAsync(),
    //Ingresamos los interceptores
     { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true },
     {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
