import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Connected manager data
  currentManager = {
    name: 'Marie Dupont',
    role: 'Manager',
    avatar: '👨‍💼'
  };

  // Quick statistics
  quickStats = {
    totalSales: 1247.50,
    todaySales: 89.30,
    activeMocktails: 7,
    lowStockItems: 2
  };

  // Real-time time variables
  currentTime: string = '';
  currentDate: string = '';
  private timeInterval: number | null = null;

  // Modal variables
  showNotificationsModal: boolean = false;
  showSettingsModal: boolean = false;

  // Password change form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Navigation menu
  menuItems = [
    {
      id: 'gestion-mocktails',
      title: 'Mocktails Management',
      description: 'Create, modify and manage your mocktail recipes',
      icon: '🍹',
      color: 'primary',
      route: '/gestion-mocktails',
      stats: {
        total: 7,
        available: 6,
        unavailable: 1
      }
    },
    {
      id: 'gestion-ingredients',
      title: 'Ingredients Management',
      description: 'Manage stocks and restocking alerts',
      icon: '🧪',
      color: 'secondary',
      route: '/gestion-ingredients',
      stats: {
        total: 12,
        good: 8,
        warning: 2,
        critical: 2
      }
    },
    {
      id: 'gestion-sales',
      title: 'Sales History',
      description: 'View complete transaction history',
      icon: '🧾',
      color: 'warning',
      route: '/gestion-sales',
      stats: {
        today: '€89.30',
        week: '€647.80',
        month: '€2847.50'
      }
    }
  ];

  // Active alerts
  activeAlerts = [
    {
      type: 'stock',
      message: 'Critical stock: Fresh mint (5g remaining)',
      severity: 'critical',
      icon: '⚠️'
    },
    {
      type: 'stock',
      message: 'Low stock: Pineapple juice (15cl remaining)',
      severity: 'warning',
      icon: '⚠️'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize time and date immediately
    this.updateTime();
    
    // Start interval to update time
    this.startTimeInterval();
  }

  ngOnDestroy(): void {
    // Clean up interval
    this.stopTimeInterval();
  }

  // Start time interval
  private startTimeInterval(): void {
    if (this.timeInterval === null && typeof window !== 'undefined') {
      this.timeInterval = window.setInterval(() => {
        this.updateTime();
      }, 1000);
    }
  }

  // Stop time interval
  private stopTimeInterval(): void {
    if (this.timeInterval !== null && typeof window !== 'undefined') {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  // Update time and date
  private updateTime(): void {
    try {
      const now = new Date();
      
      // Update time (HH:MM format only for display)
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Update date (only if it has changed)
      const newDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (this.currentDate !== newDate) {
        this.currentDate = newDate;
      }
    } catch (error) {
      console.error('Error updating time:', error);
      // In case of error, use default values
      this.currentTime = '--:--';
      this.currentDate = 'Date not available';
    }
  }

  // Navigate to a page
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Logout
  logout(): void {
    // TODO: Implement logout logic
    console.log('Logout requested');
    // this.router.navigate(['/login']);
  }

  // Show notifications
  showNotifications(): void {
    this.showNotificationsModal = true;
  }

  // Close notifications
  closeNotifications(): void {
    this.showNotificationsModal = false;
  }

  // Show settings
  showSettings(): void {
    this.showSettingsModal = true;
  }

  // Close settings
  closeSettings(): void {
    this.showSettingsModal = false;
    // Reset form
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Change password
  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (this.passwordForm.newPassword.length < 6) {
      alert('New password must contain at least 6 characters');
      return;
    }
    
    // TODO: Implement password change logic
    console.log('Password change requested');
    alert('Password changed successfully!');
    this.closeSettings();
  }

  // Get color class for cards
  getCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': 'card-primary',
      'secondary': 'card-secondary',
      'success': 'card-success',
      'warning': 'card-warning'
    };
    return colorMap[color] || 'card-primary';
  }

  // Get severity class for alerts
  getAlertSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'alert-critical',
      'warning': 'alert-warning',
      'info': 'alert-info'
    };
    return severityMap[severity] || 'alert-info';
  }

  // Format an amount
  formatAmount(amount: number): string {
    return amount.toFixed(2) + '€';
  }

  // Public methods for time and date
  getCurrentTime(): string {
    return this.currentTime || '--:--';
  }

  getCurrentDate(): string {
    return this.currentDate || 'Date not available';
  }
}
