import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartSettings } from './chart-export.service';
import { getColorScheme } from './chart-config';

@Component({
  selector: 'app-chart-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>⚙️ Chart Settings</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <div class="settings-section">
            <h3>Display</h3>

            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" [checked]="localSettings.showLegend" (change)="onCheckboxChange('showLegend', $event)">
                <span class="checkmark"></span>
                Show Legend
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" [checked]="localSettings.showGrid" (change)="onCheckboxChange('showGrid', $event)">
                <span class="checkmark"></span>
                Show Grid
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" [checked]="localSettings.animation" (change)="onCheckboxChange('animation', $event)">
                <span class="checkmark"></span>
                Animations
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" [checked]="localSettings.responsive" (change)="onCheckboxChange('responsive', $event)">
                <span class="checkmark"></span>
                Responsive
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h3>Thème</h3>

            <div class="setting-item">
              <label class="setting-label">Thème</label>
              <select [value]="localSettings.theme" (change)="onSelectChange('theme', $event)" class="setting-select">
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">Schéma de couleurs</label>
              <select [value]="localSettings.colorScheme" (change)="onSelectChange('colorScheme', $event)" class="setting-select">
                <option value="default">Défaut</option>
                <option value="colorblind">Daltonien</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>
          </div>

          <div class="settings-section">
            <h3>Preview</h3>
            <div class="preview-container">
              <div class="preview-chart" [class.dark-theme]="localSettings.theme === 'dark'">
                <div class="preview-bar" [style.background]="getPreviewColor(0)" style="height: 60%;"></div>
                <div class="preview-bar" [style.background]="getPreviewColor(1)" style="height: 80%;"></div>
                <div class="preview-bar" [style.background]="getPreviewColor(2)" style="height: 40%;"></div>
                <div class="preview-bar" [style.background]="getPreviewColor(3)" style="height: 90%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="resetToDefault()">
            🔄 Reset
          </button>
          <button class="btn btn-primary" (click)="saveSettings()">
            💾 Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25px 30px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-body {
      padding: 30px;
    }

    .settings-section {
      margin-bottom: 30px;
    }

    .settings-section h3 {
      color: #333;
      margin: 0 0 20px 0;
      font-size: 18px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }

    .setting-item {
      margin-bottom: 15px;
    }

    .setting-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: #555;
    }

    .setting-label input[type="checkbox"] {
      margin-right: 10px;
      width: 18px;
      height: 18px;
      accent-color: #ff7e5f;
    }

    .setting-select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-family: 'Quicksand', Arial, sans-serif;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s ease;
    }

    .setting-select:focus {
      outline: none;
      border-color: #ff7e5f;
    }

    .preview-container {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }

    .preview-chart {
      display: flex;
      align-items: end;
      justify-content: center;
      gap: 10px;
      height: 100px;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }

    .preview-chart.dark-theme {
      background: #333;
    }

    .preview-bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      padding: 25px 30px;
      border-top: 1px solid #eee;
      gap: 15px;
    }

    .btn {
      padding: 12px 25px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-family: 'Quicksand', Arial, sans-serif;
    }

    .btn-outline {
      background: white;
      border: 2px solid #e0e0e0;
      color: #666;
    }

    .btn-outline:hover {
      border-color: #ff7e5f;
      color: #ff7e5f;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ff7e5f 0%, #ffb347 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 126, 95, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 126, 95, 0.4);
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 20px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 20px;
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ChartSettingsModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() settings: ChartSettings = {
    showLegend: true,
    showGrid: true,
    animation: true,
    responsive: true,
    theme: 'light',
    colorScheme: 'default'
  };

  @Output() settingsChange = new EventEmitter<ChartSettings>();
  @Output() close = new EventEmitter<void>();

  localSettings: ChartSettings = { ...this.settings };

  ngOnInit(): void {
    this.localSettings = { ...this.settings };
  }

  ngOnChanges(): void {
    if (this.settings) {
      this.localSettings = { ...this.settings };
    }
  }

  onCheckboxChange(key: keyof ChartSettings, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.updateSetting(key, target.checked);
    }
  }

  onSelectChange(key: keyof ChartSettings, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateSetting(key, target.value);
    }
  }

  updateSetting(key: keyof ChartSettings, value: boolean | string): void {
    (this.localSettings as any)[key] = value;
  }

  closeModal(): void {
    this.close.emit();
  }

  saveSettings(): void {
    this.settingsChange.emit(this.localSettings);
    this.closeModal();
  }

  resetToDefault(): void {
    this.localSettings = {
      showLegend: true,
      showGrid: true,
      animation: true,
      responsive: true,
      theme: 'light',
      colorScheme: 'default'
    };
  }

  getPreviewColor(index: number): string {
    const colorScheme = getColorScheme(this.localSettings);
    return colorScheme[index % colorScheme.length];
  }
}
