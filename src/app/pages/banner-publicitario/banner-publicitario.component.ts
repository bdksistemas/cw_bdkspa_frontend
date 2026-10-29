import { Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service';
declare var bootstrap: any;

@Component({
  selector: 'app-banner-publicitario',
  templateUrl: './banner-publicitario.component.html',
  styleUrl: './banner-publicitario.component.css'
})
export class BannerPublicitarioComponent {

  private apiService  = inject(ApiServiceService)

  @ViewChild('crsPub') carousel!: ElementRef;
  private intervalId: any;
  bannersPublicitarios: any[] = [];

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.apiService.obtenerBannerPublicitario().subscribe((data: any) => {
      this.bannersPublicitarios = data.results;
      // console.log('BANNERS PUBLICITARIOS: ',this.bannersPublicitarios);

      this.llenarDOM();

    });
  }
  llenarDOM(): void {
    const divPub = document.getElementById('div_pub');
    const divIndicadores = document.getElementById('div_indicadores');

    if (!divPub || !divIndicadores) return;

    divPub.innerHTML = ''; // Limpia el contenido actual
    divIndicadores.innerHTML = ''; // Limpia los indicadores actuales

    this.bannersPublicitarios.forEach((banner, index) => {
      const div = document.createElement('div');
      div.className = `carousel-item ${index === 0 ? 'active' : ''}`;

      const anchor = document.createElement('a');
      anchor.href = banner.linkweb;
      anchor.target = '_blank';

      const picture = document.createElement('picture');

      const img = document.createElement('img');
      img.src = banner.banner;
      img.alt = banner.descripcion;
      img.className = 'd-block fto-img-pub';
      img.style.width = '100%';

      picture.appendChild(img);
      anchor.appendChild(picture);
      div.appendChild(anchor);
      divPub.appendChild(div);

      // Crear indicador
      const indicador = document.createElement('button');
      indicador.type = 'button';
      indicador.dataset['bsTarget'] = '#crs_pub';
      indicador.dataset['bsSlideTo'] = index.toString();
      if (index === 0) {
        indicador.className = 'active';
        indicador.setAttribute('aria-current', 'true');
      }
      divIndicadores.appendChild(indicador);
    });
  }


  ngAfterViewInit(): void {
    this.startCarousel();
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.moveToNextSlide();
    }, 5000); // Cambia cada 5 segundos
  }

  moveToNextSlide(): void {
    const nextButton = this.carousel.nativeElement.querySelector('.carousel-control-next');
    if (nextButton) {
      nextButton.click();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

}
