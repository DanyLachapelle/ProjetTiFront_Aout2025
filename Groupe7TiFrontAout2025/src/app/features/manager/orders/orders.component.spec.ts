import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrdersComponent } from './orders.component';
import { OrderService } from '../../../services/order.service';
import { of } from 'rxjs';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  const mockOrdersResponse = {
    Sales: [
      {
        id: 1,
        tableNumber: '5',
        totalAmount: 25.50,
        saleDate: '2024-01-15T10:30:00',
        status: 'PENDING' as const,
        orderTimer: 15,
        items: [
          {
            id: 1,
            mocktailId: 1,
            mocktailName: 'Virgin Mojito',
            quantity: 2,
            unitPrice: 8.50,
            totalPrice: 17.00
          }
        ]
      },
      {
        id: 2,
        tableNumber: '3',
        totalAmount: 16.00,
        saleDate: '2024-01-15T10:25:00',
        status: 'IN_PREPARATION' as const,
        orderTimer: 15,
        items: [
          {
            id: 2,
            mocktailId: 2,
            mocktailName: 'Virgin Colada',
            quantity: 1,
            unitPrice: 8.50,
            totalPrice: 8.50
          },
          {
            id: 3,
            mocktailId: 3,
            mocktailName: 'Sunset Spritz',
            quantity: 1,
            unitPrice: 7.50,
            totalPrice: 7.50
          }
        ]
      }
    ]
  };

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', [
      'getAllOrders',
      'advanceOrderStatus'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OrdersComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;

    // Configuration des spies
    orderService.getAllOrders.and.returnValue(of(mockOrdersResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    component.ngOnInit();
    
    expect(orderService.getAllOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrdersResponse.Sales);
    expect(component.filteredOrders).toEqual(mockOrdersResponse.Sales);
    expect(component.isLoading).toBeFalse();
  });

  it('should apply filters correctly', () => {
    component.orders = mockOrdersResponse.Sales;
    component.statusFilter = 'PENDING';
    
    component.applyFilters();
    
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].status).toBe('PENDING');
  });

  it('should filter by table number', () => {
    component.orders = mockOrdersResponse.Sales;
    component.tableFilter = '5';
    
    component.applyFilters();
    
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].tableNumber).toBe('5');
  });

  it('should sort by priority correctly', () => {
    component.orders = mockOrdersResponse.Sales;
    component.sortBy = 'priority';
    
    component.applyFilters();
    
    // Plus ancienne en premier
    expect(component.filteredOrders[0].id).toBe(2);
    expect(component.filteredOrders[1].id).toBe(1);
  });

  it('should get status config correctly', () => {
    const config = component.getStatusConfig('PENDING');
    
    expect(config.status).toBe('PENDING');
    expect(config.label).toBe('En attente');
    expect(config.icon).toBe('⏳');
    expect(config.actionLabel).toBe('Commencer');
    expect(config.nextStatus).toBe('IN_PREPARATION');
  });

  it('should check if order can advance status', () => {
    const order = mockOrdersResponse.Sales[0]; // PENDING
    const canAdvance = component.canAdvanceStatus(order);
    
    expect(canAdvance).toBeTrue();
  });

  it('should not allow advance for delivered orders', () => {
    const deliveredOrder = { ...mockOrdersResponse.Sales[0], status: 'DELIVERED' as const };
    const canAdvance = component.canAdvanceStatus(deliveredOrder);
    
    expect(canAdvance).toBeFalse();
  });

  it('should advance order status', () => {
    const order = mockOrdersResponse.Sales[0];
    const mockResponse = { saleId: 1, newStatus: 'IN_PREPARATION' as const };
    orderService.advanceOrderStatus.and.returnValue(of(mockResponse));
    
    component.advanceOrderStatus(order);
    
    expect(orderService.advanceOrderStatus).toHaveBeenCalledWith(order.id);
    expect(component.processingOrderId).toBe(order.id);
  });

  it('should format date correctly', () => {
    const formattedDate = component.getFormattedDate('2024-01-15T10:30:00');
    expect(formattedDate).toContain('15/01/2024');
  });

  it('should calculate order age correctly', () => {
    const now = new Date();
    const orderDate = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    const age = component.getOrderAge(orderDate.toISOString());
    
    expect(age).toBe('30 min');
  });

  it('should determine order priority correctly', () => {
    const now = new Date();
    const oldOrder = new Date(now.getTime() - 35 * 60 * 1000); // 35 minutes ago
    const mediumOrder = new Date(now.getTime() - 20 * 60 * 1000); // 20 minutes ago
    const newOrder = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    
    expect(component.getOrderPriority(oldOrder.toISOString())).toBe('high');
    expect(component.getOrderPriority(mediumOrder.toISOString())).toBe('medium');
    expect(component.getOrderPriority(newOrder.toISOString())).toBe('low');
  });

  it('should get items summary correctly', () => {
    const singleItem = [{ mocktailName: 'Virgin Mojito' }];
    const multipleItems = [
      { mocktailName: 'Virgin Mojito' },
      { mocktailName: 'Virgin Colada' },
      { mocktailName: 'Sunset Spritz' }
    ];
    
    expect(component.getItemsSummary(singleItem)).toBe('Virgin Mojito');
    expect(component.getItemsSummary(multipleItems)).toBe('Virgin Mojito +2 autre(s)');
  });

  it('should calculate total items correctly', () => {
    const items = [
      { quantity: 2 },
      { quantity: 1 },
      { quantity: 3 }
    ];
    
    const total = component.getTotalItems(items);
    expect(total).toBe(6);
  });

  it('should get active orders count', () => {
    component.orders = mockOrdersResponse.Sales;
    const activeCount = component.getActiveOrdersCount();
    
    expect(activeCount).toBe(2); // Both orders are not delivered
  });

  it('should get orders by status count', () => {
    component.orders = mockOrdersResponse.Sales;
    const pendingCount = component.getOrdersByStatus('PENDING');
    const preparingCount = component.getOrdersByStatus('IN_PREPARATION');
    
    expect(pendingCount).toBe(1);
    expect(preparingCount).toBe(1);
  });

  it('should handle API error gracefully', () => {
    orderService.getAllOrders.and.returnValue(
      of().pipe(() => {
        throw new Error('API Error');
      })
    );
    
    component['loadOrders']();
    
    expect(component.error).toBe('Impossible de charger les commandes');
    expect(component.isLoading).toBeFalse();
  });

  it('should clear interval on destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnInit();
    component.ngOnDestroy();
    
    expect(window.clearInterval).toHaveBeenCalled();
  });

  it('should refresh orders when refreshOrders is called', () => {
    component.refreshOrders();
    
    expect(orderService.getAllOrders).toHaveBeenCalled();
  });

  it('should apply filters when filter changes', () => {
    spyOn(component as any, 'applyFilters');
    
    component.onStatusFilterChange();
    component.onTableFilterChange();
    component.onSortChange();
    
    expect(component['applyFilters']).toHaveBeenCalledTimes(3);
  });
});


