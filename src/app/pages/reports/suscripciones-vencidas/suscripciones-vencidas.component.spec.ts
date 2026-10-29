import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuscripcionesVencidasComponent } from './suscripciones-vencidas.component';

describe('SuscripcionesVencidasComponent', () => {
  let component: SuscripcionesVencidasComponent;
  let fixture: ComponentFixture<SuscripcionesVencidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuscripcionesVencidasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuscripcionesVencidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
