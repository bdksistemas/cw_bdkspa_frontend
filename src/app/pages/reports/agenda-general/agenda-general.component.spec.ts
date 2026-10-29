import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaGeneralComponent } from './agenda-general.component';

describe('AgendaGeneralComponent', () => {
  let component: AgendaGeneralComponent;
  let fixture: ComponentFixture<AgendaGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaGeneralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgendaGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
