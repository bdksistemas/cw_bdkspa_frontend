import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaSalaComponent } from './agenda-sala.component';

describe('AgendaSalaComponent', () => {
  let component: AgendaSalaComponent;
  let fixture: ComponentFixture<AgendaSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaSalaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgendaSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
