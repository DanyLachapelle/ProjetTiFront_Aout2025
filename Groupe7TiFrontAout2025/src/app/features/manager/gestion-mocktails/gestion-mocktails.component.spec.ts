import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMocktailsComponent } from './gestion-mocktails.component';

describe('GestionMocktailsComponent', () => {
  let component: GestionMocktailsComponent;
  let fixture: ComponentFixture<GestionMocktailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionMocktailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionMocktailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
