import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionIngredientsComponent } from './gestion-ingredients.component';

describe('GestionIngredientsComponent', () => {
  let component: GestionIngredientsComponent;
  let fixture: ComponentFixture<GestionIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionIngredientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
