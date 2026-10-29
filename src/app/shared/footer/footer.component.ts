import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  year = new Date().getFullYear();

  clickNavegacion(){
    //Aqui abrimos otra pestaña del navegador a la pagina de "https://www.bdksistemas.com.mx/"
    window.open("https://google.com/", "_blank");
  }

}
