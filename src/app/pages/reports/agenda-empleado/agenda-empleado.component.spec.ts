import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaEmpleadoComponent } from './agenda-empleado.component';

describe('AgendaEmpleadoComponent', () => {
  let component: AgendaEmpleadoComponent;
  let fixture: ComponentFixture<AgendaEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaEmpleadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgendaEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
