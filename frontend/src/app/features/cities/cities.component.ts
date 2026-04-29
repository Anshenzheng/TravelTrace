import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatNativeDateModule } from '@angular/material/core';
import { CityService } from '../../core/services/city.service';
import { City, CityStatus, UserCity, AddCityRequest } from '../../core/models/city.model';
import { ApiResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-title">
          <mat-icon>location_city</mat-icon>
          <h1>探索城市</h1>
        </div>
        <div class="search-bar">
          <mat-form-field appearance="outline">
            <mat-label>搜索城市</mat-label>
            <input matInput (keyup)="onSearch($event)" placeholder="输入城市名称...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <!-- All Cities Tab -->
      <mat-tab-group>
        <mat-tab label="全部城市">
          <div class="city-grid" *ngIf="filteredCities.length > 0; else noCities">
            <mat-card class="city-card" *ngFor="let city of filteredCities">
              <div class="city-image" *ngIf="city.imageUrl">
                <img [src]="city.imageUrl" alt="{{city.name}}">
              </div>
              <div class="city-image-placeholder" *ngIf="!city.imageUrl">
                <mat-icon>location_city</mat-icon>
              </div>
              <mat-card-content>
                <h3 class="city-name">{{ city.name }}</h3>
                <p class="city-location">
                  <mat-icon>place</mat-icon>
                  {{ city.country }} {{ city.province || '' }}
                </p>
                <p class="city-description" *ngIf="city.description">
                  {{ city.description | slice:0:60 }}...
                </p>
                <div class="city-actions">
                  <button mat-raised-button color="primary"
                          (click)="openAddCityDialog(city, CityStatus.VISITED)">
                    <mat-icon>check_circle</mat-icon>
                    已到过
                  </button>
                  <button mat-stroked-button color="accent"
                          (click)="openAddCityDialog(city, CityStatus.WANT_TO_VISIT)">
                    <mat-icon>star</mat-icon>
                    想去
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <ng-template #noCities>
            <div class="empty-state">
              <mat-icon>location_city</mat-icon>
              <h3>未找到城市</h3>
              <p>尝试使用其他关键词搜索</p>
            </div>
          </ng-template>
        </mat-tab>

        <!-- My Cities Tab -->
        <mat-tab label="我的城市">
          <div *ngIf="myCities.length > 0; else noMyCities">
            <div class="my-cities-stats">
              <mat-chip class="chip-visited">
                <mat-icon>check_circle</mat-icon>
                已到: {{ visitedCount }}
              </mat-chip>
              <mat-chip class="chip-want">
                <mat-icon>star</mat-icon>
                想去: {{ wantToVisitCount }}
              </mat-chip>
            </div>

            <div class="city-grid">
              <mat-card class="city-card" *ngFor="let userCity of myCities">
                <div class="city-status-badge" [class.visited]="userCity.status === CityStatus.VISITED"
                     [class.want-to-visit]="userCity.status === CityStatus.WANT_TO_VISIT">
                  <mat-icon>{{ userCity.status === CityStatus.VISITED ? 'check_circle' : 'star' }}</mat-icon>
                  {{ userCity.status === CityStatus.VISITED ? '已到过' : '想去' }}
                </div>
                <div class="city-image" *ngIf="userCity.cityImageUrl">
                  <img [src]="userCity.cityImageUrl" alt="{{userCity.cityName}}">
                </div>
                <div class="city-image-placeholder" *ngIf="!userCity.cityImageUrl">
                  <mat-icon>location_city</mat-icon>
                </div>
                <mat-card-content>
                  <h3 class="city-name">{{ userCity.cityName }}</h3>
                  <p class="city-location">
                    <mat-icon>place</mat-icon>
                    {{ userCity.country }} {{ userCity.province || '' }}
                  </p>
                  <div class="city-rating" *ngIf="userCity.rating > 0">
                    <mat-icon *ngFor="let i of [1,2,3,4,5]"
                              [class.filled]="i <= userCity.rating">star</mat-icon>
                  </div>
                  <p class="city-notes" *ngIf="userCity.notes">{{ userCity.notes }}</p>
                  <div class="city-actions">
                    <button mat-icon-button color="primary" matTooltip="编辑"
                            (click)="openEditCityDialog(userCity)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" matTooltip="移除"
                            (click)="removeCity(userCity)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <ng-template #noMyCities>
            <div class="empty-state">
              <mat-icon>map</mat-icon>
              <h3>还没有添加任何城市</h3>
              <p>浏览「全部城市」标签页，添加你去过或想去的城市</p>
              <button mat-raised-button color="primary" (click)="switchToTab(0)">
                <mat-icon>explore</mat-icon>
                探索城市
              </button>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
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

    .search-bar {
      min-width: 300px;
    }

    ::ng-deep .mat-mdc-tab-group {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    ::ng-deep .mat-mdc-tab-header {
      padding: 0 20px;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      padding: 20px;
    }

    .city-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .city-card {
      overflow: hidden;
      position: relative;
    }

    .city-status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      z-index: 10;
    }

    .city-status-badge.visited {
      background: rgba(72, 187, 120, 0.9);
      color: white;
    }

    .city-status-badge.want-to-visit {
      background: rgba(237, 137, 54, 0.9);
      color: white;
    }

    .city-status-badge mat-icon {
      font-size: 1.1rem;
      height: 1.1rem;
      width: 1.1rem;
    }

    .city-image {
      height: 180px;
      overflow: hidden;
    }

    .city-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .city-card:hover .city-image img {
      transform: scale(1.05);
    }

    .city-image-placeholder {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .city-image-placeholder mat-icon {
      font-size: 3.5rem;
      height: 3.5rem;
      width: 3.5rem;
      color: #a0aec0;
    }

    .city-card mat-card-content {
      padding: 20px;
    }

    .city-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2d3748;
    }

    .city-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: #718096;
      margin: 0 0 12px 0;
    }

    .city-description {
      color: #718096;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .city-rating {
      display: flex;
      margin-bottom: 12px;
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
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .city-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .my-cities-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .chip-visited {
      background: rgba(72, 187, 120, 0.1) !important;
      color: #38a169 !important;
      border: 1px solid rgba(72, 187, 120, 0.3);
    }

    .chip-want {
      background: rgba(237, 137, 54, 0.1) !important;
      color: #dd6b20 !important;
      border: 1px solid rgba(237, 137, 54, 0.3);
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
      }

      .search-bar {
        width: 100%;
        min-width: auto;
      }

      .city-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CitiesComponent implements OnInit {
  CityStatus = CityStatus;

  allCities: City[] = [];
  filteredCities: City[] = [];
  myCities: UserCity[] = [];

  constructor(
    private cityService: CityService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllCities();
    this.loadMyCities();
  }

  get visitedCount(): number {
    return this.myCities.filter(c => c.status === CityStatus.VISITED).length;
  }

  get wantToVisitCount(): number {
    return this.myCities.filter(c => c.status === CityStatus.WANT_TO_VISIT).length;
  }

  loadAllCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.allCities = response.data;
          this.filteredCities = response.data;
        }
      },
      error: () => {
        this.snackBar.open('加载城市列表失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadMyCities(): void {
    this.cityService.getUserCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.myCities = response.data;
        }
      },
      error: () => {
        this.myCities = [];
      }
    });
  }

  onSearch(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const keyword = input.value.trim().toLowerCase();

    if (!keyword) {
      this.filteredCities = this.allCities;
      return;
    }

    this.filteredCities = this.allCities.filter(city =>
      city.name.toLowerCase().includes(keyword) ||
      city.nameEn?.toLowerCase().includes(keyword) ||
      city.country.toLowerCase().includes(keyword)
    );
  }

  openAddCityDialog(city: City, status: CityStatus): void {
    const dialogRef = this.dialog.open(AddCityDialogComponent, {
      width: '450px',
      data: { city, status, isEdit: false }
    });

    dialogRef.afterClosed().subscribe((result: AddCityRequest | null) => {
      if (result) {
        this.addCity(result);
      }
    });
  }

  openEditCityDialog(userCity: UserCity): void {
    const dialogRef = this.dialog.open(AddCityDialogComponent, {
      width: '450px',
      data: {
        city: {
          id: userCity.cityId,
          name: userCity.cityName
        } as City,
        status: userCity.status,
        rating: userCity.rating,
        notes: userCity.notes,
        visitDate: userCity.visitDate,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe((result: AddCityRequest | null) => {
      if (result) {
        this.addCity(result);
      }
    });
  }

  addCity(request: AddCityRequest): void {
    this.cityService.addCityToUser(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('添加成功', '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadMyCities();
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || '操作失败', '关闭', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeCity(userCity: UserCity): void {
    if (confirm(`确定要移除「${userCity.cityName}」吗？`)) {
      this.cityService.removeCityFromUser(userCity.cityId).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('已移除', '关闭', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadMyCities();
          }
        },
        error: () => {
          this.snackBar.open('移除失败', '关闭', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  switchToTab(index: number): void {
    // This would require accessing the tab group
    console.log('Switch to tab:', index);
  }
}

@Component({
  selector: 'app-add-city-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isEdit ? 'edit' : 'add_location' }}</mat-icon>
        {{ data.isEdit ? '编辑' : '添加' }}「{{ data.city.name }}」
      </h2>
      <button mat-icon-button [mat-dialog-close]>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="cityForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>状态</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="CityStatus.VISITED">
              <mat-icon style="color: #48bb78; margin-right: 8px;">check_circle</mat-icon>
              已到过
            </mat-option>
            <mat-option [value]="CityStatus.WANT_TO_VISIT">
              <mat-icon style="color: #ed8936; margin-right: 8px;">star</mat-icon>
              想去
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width"
                        *ngIf="cityForm.get('status')?.value === CityStatus.VISITED">
          <mat-label>到访日期 (可选)</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="visitDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width"
                        *ngIf="cityForm.get('status')?.value === CityStatus.VISITED">
          <mat-label>评分 (可选)</mat-label>
          <mat-select formControlName="rating">
            <mat-option [value]="0">未评分</mat-option>
            <mat-option [value]="1">⭐</mat-option>
            <mat-option [value]="2">⭐⭐</mat-option>
            <mat-option [value]="3">⭐⭐⭐</mat-option>
            <mat-option [value]="4">⭐⭐⭐⭐</mat-option>
            <mat-option [value]="5">⭐⭐⭐⭐⭐</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>备注 (可选)</mat-label>
          <textarea matInput formControlName="notes" rows="3"
                    placeholder="写下对这个城市的印象..."></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]>取消</button>
        <button mat-raised-button color="primary" type="submit"
                [disabled]="cityForm.invalid">
          {{ data.isEdit ? '保存' : '添加' }}
        </button>
      </mat-dialog-actions>
    </form>
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

    mat-dialog-content {
      padding: 20px 24px !important;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px 24px !important;
    }
  `]
})
export class AddCityDialogComponent {
  CityStatus = CityStatus;
  cityForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddCityDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cityForm = this.fb.group({
      status: [this.data?.status || CityStatus.VISITED, Validators.required],
      visitDate: [this.data?.visitDate || null],
      rating: [this.data?.rating || 0],
      notes: [this.data?.notes || '']
    });
  }

  onSubmit(): void {
    if (this.cityForm.invalid) return;

    const formValue = this.cityForm.value;
    const request: AddCityRequest = {
      cityId: this.data.city.id,
      status: formValue.status,
      visitDate: formValue.visitDate,
      rating: formValue.rating,
      notes: formValue.notes
    };

    this.dialogRef.close(request);
  }
}
