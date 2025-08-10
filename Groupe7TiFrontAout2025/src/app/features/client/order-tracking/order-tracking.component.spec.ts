import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderTrackingComponent } from './order-tracking.component';
import { SessionService } from '../../../services/session.service';
import { OrderService } from '../../../services/order.service';
import { of } from 'rxjs';

describe('OrderTrackingComponent', () => {
  let component: OrderTrackingComponent;
  let fixture: ComponentFixture<OrderTrackingComponent>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let orderService: jasmine.SpyObj<OrderService>;

  const mockOrder = {
    id: 1,
    tableNumber: '5',
    totalAmount: 25.50,
    saleDate: '2024-01-15T10:30:00',
    status: 'IN_PREPARATION' as const,
    orderTimer: 15,
    items: [
      {
        id: 1,
        mocktailId: 1,
        mocktailName: 'Virgin Mojito',
        quantity: 2,
        unitPrice: 8.50,
        totalPrice: 17.00
      },
      {
        id: 2,
        mocktailId: 2,
        mocktailName: 'Virgin Colada',
        quantity: 1,
        unitPrice: 8.50,
        totalPrice: 8.50
      }
    ]
  };

  const mockSessionData = {
    tableNumber: '5',
    sessionId: 'test-session',
    startTime: new Date(),
    duration: 900
  };

  beforeEach(async () => {
    const sessionServiceSpy = jasmine.createSpyObj('SessionService', [
      'getSessionData',
      'getRemainingTime'
    ]);
    const orderServiceSpy = jasmine.createSpyObj('OrderService', [
      'getOrderById'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OrderTrackingComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTrackingComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;

    // Configuration des spies
    sessionService.getSessionData.and.returnValue(mockSessionData);
    sessionService.getRemainingTime.and.returnValue(600);
    orderService.getOrderById.and.returnValue(of(mockOrder));

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('1');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load session data on init', () => {
    component.ngOnInit();
    expect(sessionService.getSessionData).toHaveBeenCalled();
    expect(component.sessionData).toEqual(mockSessionData);
  });

  it('should load active order on init', () => {
    component.ngOnInit();
    expect(orderService.getOrderById).toHaveBeenCalledWith(1);
    expect(component.order).toEqual(mockOrder);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when no active order found', () => {
    localStorage.getItem = jasmine.createSpy().and.returnValue(null);
    
    component.ngOnInit();
    
    expect(component.error).toBe('Aucune commande active trouvée');
    expect(component.isLoading).toBeFalse();
  });

  it('should get current status correctly', () => {
    component.order = mockOrder;
    const status = component.getCurrentStatus();
    
    expect(status).toBeTruthy();
    expect(status?.status).toBe('IN_PREPARATION');
    expect(status?.label).toBe('En préparation');
    expect(status?.icon).toBe('👨‍🍳');
  });

  it('should calculate progress percentage correctly', () => {
    component.order = mockOrder;
    const progress = component.getProgressPercentage();
    
    expect(progress).toBe(50); // IN_PREPARATION = 50%
  });

  it('should format date correctly', () => {
    const formattedDate = component.getFormattedDate('2024-01-15T10:30:00');
    expect(formattedDate).toContain('15/01/2024');
  });

  it('should get estimated time remaining', () => {
    component.order = mockOrder;
    const estimatedTime = component.getEstimatedTimeRemaining();
    
    expect(estimatedTime).toBe('10 min');
  });

  it('should get table number from session data', () => {
    component.sessionData = mockSessionData;
    const tableNumber = component.getTableNumber();
    
    expect(tableNumber).toBe('5');
  });

  it('should format remaining time correctly', () => {
    const formattedTime = component.getFormattedRemainingTime();
    expect(formattedTime).toBe('10:00');
  });

  it('should refresh order when refreshOrder is called', () => {
    component.refreshOrder();
    
    expect(component.isLoading).toBeTrue();
    expect(orderService.getOrderById).toHaveBeenCalled();
  });

  it('should clear interval on destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnInit();
    component.ngOnDestroy();
    
    expect(window.clearInterval).toHaveBeenCalled();
  });

  it('should redirect to menu when order is delivered', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    component.order = { ...mockOrder, status: 'DELIVERED' };
    
    component['checkOrderCompletion']();
    
    // Attendre que le timeout se déclenche
    setTimeout(() => {
      expect(routerSpy).toHaveBeenCalledWith(['/menu']);
    }, 5100);
  });

  it('should handle API error gracefully', () => {
    orderService.getOrderById.and.returnValue(
      of().pipe(() => {
        throw new Error('API Error');
      })
    );
    
    component['loadActiveOrder']();
    
    expect(component.error).toBe('Impossible de charger votre commande');
    expect(component.isLoading).toBeFalse();
  });
});


