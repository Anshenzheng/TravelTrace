import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import * as L from 'leaflet';
import html2canvas from 'html2canvas';
import { CityService } from '../../core/services/city.service';
import { CityStatus, MapData, MapCity, AddCityRequest } from '../../core/models/city.model';
import { City } from '../../core/models/city.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="map-header">
        <div class="header-title">
          <mat-icon>map</mat-icon>
          <h1>我的足迹</h1>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="exportMap()">
            <mat-icon>download</mat-icon>
            导出地图
          </button>
          <button mat-raised-button color="accent" (click)="openShareDialog()">
            <mat-icon>share</mat-icon>
            生成长图
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="mapData">
        <mat-card class="stat-card">
          <div class="stat-icon visited">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ mapData.stats.visitedCount }}</h3>
            <p>已到城市</p>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon want-to-visit">
            <mat-icon>star</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ mapData.stats.wantToVisitCount }}</h3>
            <p>想去城市</p>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon countries">
            <mat-icon>public</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ mapData.stats.countriesCount }}</h3>
            <p>覆盖国家</p>
          </div>
        </mat-card>
      </div>

      <!-- Map Container -->
      <mat-card class="map-card">
        <div class="map-legend">
          <div class="legend-item">
            <span class="marker visited-marker"></span>
            <span>已到城市</span>
          </div>
          <div class="legend-item">
            <span class="marker want-to-visit-marker"></span>
            <span>想去城市</span>
          </div>
        </div>
        <div #mapContainer id="map" class="leaflet-container"></div>
      </mat-card>

      <!-- City Lists -->
      <div class="cities-section">
        <!-- Visited Cities -->
        <div class="city-list-section" *ngIf="mapData?.visitedCities?.length > 0">
          <h2 class="section-title">
            <mat-icon class="visited-icon">check_circle</mat-icon>
            已到城市 ({{ mapData?.visitedCities?.length }})
          </h2>
          <div class="city-grid">
            <mat-card class="city-card" *ngFor="let city of mapData?.visitedCities">
              <div class="city-image" *ngIf="city.imageUrl">
                <img [src]="city.imageUrl" alt="{{city.name}}">
              </div>
              <div class="city-info">
                <h3>{{ city.name }}</h3>
                <p class="city-country">{{ city.country }}</p>
                <div class="city-rating" *ngIf="city.rating > 0">
                  <mat-icon *ngFor="let i of [1,2,3,4,5]"
                            [class.filled]="i <= city.rating">star</mat-icon>
                </div>
                <p class="city-notes" *ngIf="city.notes">{{ city.notes }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Want to Visit Cities -->
        <div class="city-list-section" *ngIf="mapData?.wantToVisitCities?.length > 0">
          <h2 class="section-title">
            <mat-icon class="want-icon">star</mat-icon>
            想去城市 ({{ mapData?.wantToVisitCities?.length }})
          </h2>
          <div class="city-grid">
            <mat-card class="city-card" *ngFor="let city of mapData?.wantToVisitCities">
              <div class="city-image" *ngIf="city.imageUrl">
                <img [src]="city.imageUrl" alt="{{city.name}}">
              </div>
              <div class="city-info">
                <h3>{{ city.name }}</h3>
                <p class="city-country">{{ city.country }}</p>
                <p class="city-notes" *ngIf="city.notes">{{ city.notes }}</p>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="(!mapData?.visitedCities?.length && !mapData?.wantToVisitCities?.length)">
          <mat-icon>map</mat-icon>
          <h3>还没有足迹</h3>
          <p>开始添加你去过或想去的城市吧！</p>
          <button mat-raised-button color="primary" routerLink="/cities">
            <mat-icon>add_location</mat-icon>
            探索城市
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden element for export -->
    <div #exportContainer style="position: absolute; left: -9999px;">
      <div class="export-card">
        <div class="export-header">
          <mat-icon>explore</mat-icon>
          <h1>我的旅行足迹</h1>
        </div>
        <div class="export-stats">
          <span>已到城市: {{ mapData?.stats?.visitedCount || 0 }}</span>
          <span>想去城市: {{ mapData?.stats?.wantToVisitCount || 0 }}</span>
          <span>覆盖国家: {{ mapData?.stats?.countriesCount || 0 }}</span>
        </div>
        <div class="export-map" #exportMapContainer></div>
        <div class="export-footer">
          <p>来自「足记」 - 记录每一次旅行</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: #667eea;
    }

    .header-title h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      color: white;
    }

    .stat-icon.visited {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }

    .stat-icon.want-to-visit {
      background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    }

    .stat-icon.countries {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .stat-content p {
      color: #718096;
      margin: 0;
    }

    .map-card {
      margin-bottom: 40px;
    }

    .map-legend {
      display: flex;
      gap: 30px;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #718096;
    }

    .marker {
      width: 24px;
      height: 36px;
    }

    .visited-marker {
      background: #48bb78;
      clip-path: polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%);
    }

    .want-to-visit-marker {
      background: #ed8936;
      clip-path: polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%);
    }

    #map {
      height: 500px;
      width: 100%;
      border-radius: 0 0 16px 16px;
    }

    .cities-section {
      margin-top: 40px;
    }

    .city-list-section {
      margin-bottom: 40px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 20px;
    }

    .visited-icon {
      color: #48bb78;
    }

    .want-icon {
      color: #ed8936;
    }

    .city-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .city-card {
      overflow: hidden;
    }

    .city-image {
      height: 150px;
      overflow: hidden;
    }

    .city-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .city-info {
      padding: 16px;
    }

    .city-info h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2d3748;
    }

    .city-country {
      color: #718096;
      font-size: 0.9rem;
      margin: 0 0 8px 0;
    }

    .city-rating {
      display: flex;
      margin-bottom: 8px;
    }

    .city-rating mat-icon {
      font-size: 1.1rem;
      height: 1.1rem;
      width: 1.1rem;
      color: #e2e8f0;
    }

    .city-rating mat-icon.filled {
      color: #f6ad55;
    }

    .city-notes {
      color: #718096;
      font-size: 0.85rem;
      margin: 0;
      line-height: 1.5;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #718096;
    }

    .empty-state mat-icon {
      font-size: 5rem;
      height: 5rem;
      width: 5rem;
      margin-bottom: 20px;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    /* Export styles */
    .export-card {
      width: 800px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      font-family: 'Noto Sans SC', sans-serif;
    }

    .export-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .export-header mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      color: white;
    }

    .export-header h1 {
      font-size: 2.5rem;
      color: white;
      margin: 0;
    }

    .export-stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      margin-bottom: 30px;
    }

    .export-map {
      height: 400px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
    }

    .export-footer {
      text-align: center;
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.7);
    }

    @media (max-width: 768px) {
      .map-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      #map {
        height: 350px;
      }
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('exportMapContainer') exportMapContainer!: ElementRef;

  mapData: MapData | null = null;
  private map: any;
  private exportMap: any;

  constructor(
    private cityService: CityService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMapData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  loadMapData(): void {
    this.cityService.getUserMapData().subscribe({
      next: (response) => {
        if (response.success) {
          this.mapData = response.data;
          this.updateMapMarkers();
        }
      },
      error: () => {
        this.snackBar.open('加载地图数据失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  initMap(): void {
    this.map = L.map('map').setView([35.8617, 104.1954], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  updateMapMarkers(): void {
    if (!this.map || !this.mapData) return;

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const greenIcon = this.createCustomIcon('#48bb78');
    const orangeIcon = this.createCustomIcon('#ed8936');

    this.mapData.visitedCities.forEach(city => {
      const marker = L.marker([city.latitude, city.longitude], { icon: greenIcon })
        .addTo(this.map)
        .bindPopup(this.createPopup(city, '已到城市'));
    });

    this.mapData.wantToVisitCities.forEach(city => {
      const marker = L.marker([city.latitude, city.longitude], { icon: orangeIcon })
        .addTo(this.map)
        .bindPopup(this.createPopup(city, '想去城市'));
    });

    const allCities = [...this.mapData.visitedCities, ...this.mapData.wantToVisitCities];
    if (allCities.length > 0) {
      const latlngs = allCities.map(city => [city.latitude, city.longitude]);
      this.map.fitBounds(latlngs, { padding: [50, 50] });
    }
  }

  createCustomIcon(color: string): any {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 30px;
          height: 44px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [30, 44],
      iconAnchor: [15, 44]
    });
  }

  createPopup(city: MapCity, status: string): string {
    return `
      <div style="text-align: center; min-width: 150px;">
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">${city.name}</h3>
        <p style="margin: 0 0 8px 0; color: #718096; font-size: 0.9rem;">${city.country}</p>
        <p style="margin: 0; color: #667eea; font-weight: 500;">${status}</p>
      </div>
    `;
  }

  exportMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    html2canvas(mapElement).then(canvas => {
      const link = document.createElement('a');
      link.download = '我的足迹地图.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      this.snackBar.open('地图已保存到本地', '关闭', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });
  }

  openShareDialog(): void {
    this.dialog.open(ShareMapDialogComponent, {
      width: '500px',
      data: { mapData: this.mapData }
    });
  }
}

@Component({
  selector: 'app-share-map-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>share</mat-icon>
        分享我的足迹
      </h2>
      <button mat-icon-button [mat-dialog-close]>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="share-preview">
        <div class="preview-card">
          <div class="preview-header">
            <mat-icon>explore</mat-icon>
            <span>我的旅行足迹</span>
          </div>
          <div class="preview-stats">
            <div class="stat-item">
              <span class="stat-value">{{ data.mapData?.stats?.visitedCount || 0 }}</span>
              <span class="stat-label">已到城市</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ data.mapData?.stats?.wantToVisitCount || 0 }}</span>
              <span class="stat-label">想去城市</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ data.mapData?.stats?.countriesCount || 0 }}</span>
              <span class="stat-label">覆盖国家</span>
            </div>
          </div>
          <div class="preview-footer">
            来自「足记」- 记录每一次旅行
          </div>
        </div>
      </div>

      <p class="share-description">
        点击下方按钮生成长图，即可分享到微信、微博等社交媒体。
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]>取消</button>
      <button mat-raised-button color="primary" (click)="generateShareImage()">
        <mat-icon>image</mat-icon>
        生成长图
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0 24px;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .share-preview {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    .preview-card {
      width: 300px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      color: white;
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .preview-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-label {
      display: block;
      font-size: 0.85rem;
      opacity: 0.8;
    }

    .preview-footer {
      text-align: center;
      font-size: 0.85rem;
      opacity: 0.7;
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 16px;
    }

    .share-description {
      text-align: center;
      color: #718096;
      font-size: 0.95rem;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px 24px;
    }
  `]
})
export class ShareMapDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShareMapDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  generateShareImage(): void {
    this.snackBar.open('长图生成中...', '关闭', {
      duration: 3000
    });

    setTimeout(() => {
      this.snackBar.open('长图已生成，请在实际运行中使用 html2canvas 导出', '关闭', {
        duration: 5000
      });
      this.dialogRef.close();
    }, 1500);
  }
}
