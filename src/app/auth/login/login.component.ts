import { Component, ViewEncapsulation } from '@angular/core';
import { Usuarios } from '../../interfaces/usuarios.interface';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { environment } from '../../../enviroments/enviroment';
import 'animate.css';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../services/api-service.service';
import { catchError, first, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None, // Permite que los estilos de ANGULAR MATERIAL se apliquen correctamente DESDE NUESTRO CSS
})
export class LoginComponent {
  titulo: string = 'Software para salones de belleza, estéticas y spa';
  titulosize: string = '20px';

  usuario = '';
  pass = '';
  hide = true;

  usuarios!: Usuarios;

  constructor(
    private usuariosSvc: AuthService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private apiService: ApiServiceService,
    private authService: AuthService,
    private router : Router
  ) {
    this.titulo = environment.SUBTITULO_LOGO_LOGIN.title;
    this.titulosize = environment.SUBTITULO_LOGO_LOGIN.size;
  }
  loginForm = this.fb.group({
    idcw: ['', [Validators.required]],
    cwuser: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ],
    ],
    cwpassword: ['', [Validators.required]],
  });

  onSubmit() {
    //Para evitar que se presione el boton de login varias veces y se hagan varias peticiones a la API se deshabilita el boton
    //de login una vez que se presiona.
    let btnLogin = document.getElementById('btnLogin');
    btnLogin!.setAttribute('disabled', 'true');

    //Validamos que los campos no esten vaciós uno por uno.
    if (this.loginForm.get('idcw')?.value === '') {
      Swal.fire({
        icon: 'error',
        iconColor: '#a30909',
        title: 'Inténtalo nuevamente.',
        text: 'Tu ID del concentrador no puede estar vació.',
        heightAuto: false,
        confirmButtonColor: '#a30909',
        showCloseButton: true,
        timer: 5000,
      });

      //Habilitamos el boton de login nuevamente.
      btnLogin!.removeAttribute('disabled');
      return;
    }

    if (this.loginForm.get('cwuser')?.value === '') {
      Swal.fire({
        icon: 'error',
        iconColor: '#a30909',
        title: 'Inténtalo nuevamente.',
        text: 'Tu correo de USUARIO no puede estar vació.',
        heightAuto: false,
        confirmButtonColor: '#a30909',
        showCloseButton: true,
        timer: 5000,
      });
      //Habilitamos el boton de login nuevamente.
      btnLogin!.removeAttribute('disabled');
      return;
    }

    if (this.loginForm.get('cwpassword')?.value === '') {
      Swal.fire({
        icon: 'error',
        iconColor: '#a30909',
        title: 'Inténtalo nuevamente.',
        text: 'Ingresa la contraseña, el campo no puede estar vació.',
        heightAuto: false,
        confirmButtonColor: '#a30909',
        showCloseButton: true,
        timer: 5000,
      });
      //Habilitamos el boton de login nuevamente.
      btnLogin!.removeAttribute('disabled');
      return;
    }

    //Mandamos los datos ala API:
    let data = {
      idcw: this.loginForm.get('idcw')?.value,
      cw_user: this.loginForm.get('cwuser')?.value,
      cw_psw: this.loginForm.get('cwpassword')?.value,
    };

    this.authService
      .login(data)
      .pipe(
        first(),
      )
      .subscribe((res: any) => {
        //Habilitamos el boton de login nuevamente.
        btnLogin!.removeAttribute('disabled');

        if (res == true) {
          this.toast.success(
                'Bienvenido ' + localStorage.getItem('nom_cw')!,
                'Inicio de sesión exitoso',
                {
                  /// Mostramos en la parte inferior y en el centro
                  positionClass: 'toast-bottom-center',
                  // Tiempo de duración del toast
                  timeOut: 5000,
                  // Mostramos el botón de cerrar
                  closeButton: true,
                }
              );
          //Redireccionamos al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.toast.error(
            'Verifica correctamente los campos.',
            'Inténtalo nuevamente',
            {
              positionClass: 'toast-bottom-center',
              timeOut: 5000,
            }
          );
          //Habilitamos el boton de login nuevamente.
          btnLogin!.removeAttribute('disabled');

        }
      });
  }
}
