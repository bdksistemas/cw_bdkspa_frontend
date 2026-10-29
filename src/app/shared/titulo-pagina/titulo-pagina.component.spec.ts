import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TituloPaginaComponent } from './titulo-pagina.component';

describe('TituloPaginaComponent', () => {
  let component: TituloPaginaComponent;
  let fixture: ComponentFixture<TituloPaginaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TituloPaginaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TituloPaginaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
