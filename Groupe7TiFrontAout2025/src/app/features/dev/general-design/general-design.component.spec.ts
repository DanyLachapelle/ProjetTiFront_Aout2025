import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDesignComponent } from './general-design.component';

describe('GeneralDesignComponent', () => {
  let component: GeneralDesignComponent;
  let fixture: ComponentFixture<GeneralDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
