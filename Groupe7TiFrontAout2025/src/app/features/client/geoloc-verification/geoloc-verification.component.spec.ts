import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeolocVerificationComponent } from './geoloc-verification.component';

describe('GeolocVerificationComponent', () => {
  let component: GeolocVerificationComponent;
  let fixture: ComponentFixture<GeolocVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeolocVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeolocVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
