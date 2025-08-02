import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNumberComponent } from './table-number.component';

describe('TableNumberComponent', () => {
  let component: TableNumberComponent;
  let fixture: ComponentFixture<TableNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
