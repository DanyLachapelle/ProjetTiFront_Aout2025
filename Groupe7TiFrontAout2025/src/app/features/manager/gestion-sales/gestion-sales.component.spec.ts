import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSalesComponent } from './gestion-sales.component';

describe('GestionSalesComponent', () => {
  let component: GestionSalesComponent;
  let fixture: ComponentFixture<GestionSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
