import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-titulo-pagina',
  templateUrl: './titulo-pagina.component.html',
  styleUrl: './titulo-pagina.component.css'
})
export class TituloPaginaComponent {

  @Input() titulo!: string;
  nombreUsuario = 'BDK';

  constructor() { }

}
