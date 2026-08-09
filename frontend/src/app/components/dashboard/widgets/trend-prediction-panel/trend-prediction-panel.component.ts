import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { TrendPredictionResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { AiFallbackNoteComponent } from '../../../../shared/components/ai-fallback-note/ai-fallback-note.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-trend-prediction-panel',
  standalone: true,
  imports: [CommonModule, AiSkeletonLineComponent, AiEmptyHintComponent, AiFallbackNoteComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="card-premium p-4 position-relative overflow-hidden border border-slate shadow-sm h-100">
       <div class="d-flex align-items-center justify-content-between mb-4">
          <div class="d-flex align-items-center">
             <div class="icon-circle bg-indigo-soft text-indigo me-3" style="width: 40px; height: 40px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
             </div>
             <h5 class="fw-bold text-dark mb-0">AI Trend Prediction</h5>
          </div>
          <span *ngIf="state.data" class="badge rounded-pill fs-xs px-2 py-1"
                [ngClass]="{
                   'bg-success-soft text-success': state.data.trendDirection === 'IMPROVING',
                   'bg-danger-soft text-danger': state.data.trendDirection === 'WORSENING',
                   'bg-secondary-soft text-secondary': state.data.trendDirection === 'STABLE'
                }">
             {{ state.data.trendDirection }}
          </span>
       </div>

       <div *ngIf="state.loading" class="mt-3">
          <app-ai-skeleton-line [lines]="4"></app-ai-skeleton-line>
       </div>
       
       <div *ngIf="state.error" class="mt-3">
          <app-ai-empty-hint title="Prediction Unavailable" [message]="state.error"></app-ai-empty-hint>
       </div>
       
       <div *ngIf="state.data" class="mt-3">
          <!-- Chart -->
          <div style="height: 150px; width: 100%; margin-bottom: 1rem;" *ngIf="lineChartData.datasets.length">
             <canvas baseChart
                     [data]="lineChartData"
                     [options]="lineChartOptions"
                     [type]="lineChartType">
             </canvas>
          </div>
       
          <p class="fs-6 text-dark mb-2 fw-medium">{{ state.data.explanation }}</p>
          <div class="bg-surface rounded-3 p-3 mt-3 border border-indigo border-opacity-25">
             <div class="d-flex align-items-start">
               <svg width="18" height="18" class="text-indigo me-2 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
               </svg>
               <span class="fs-7 text-dark lh-sm">{{ state.data.recommendation }}</span>
             </div>
          </div>
          
          <div class="mt-3 d-flex justify-content-between align-items-center">
             <span class="fs-xs text-muted">Confidence: <span class="fw-bold">{{ state.data.confidence }}</span></span>
             <app-ai-fallback-note></app-ai-fallback-note>
          </div>
       </div>
    </div>
  `
})
export class TrendPredictionPanelComponent implements OnChanges {
  @Input() state: AiFeatureState<TrendPredictionResponse> = { loading: true, data: null, error: null };

  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, maxRotation: 0 }
      }
    },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    elements: {
      point: { radius: 2, hitRadius: 10, hoverRadius: 4 }
    }
  };
  public lineChartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state'] && this.state.data?.forecast) {
       this.updateChart(this.state.data.forecast);
    }
  }

  private updateChart(forecast: any[]) {
    this.lineChartData = {
      labels: forecast.map(f => {
         const d = new Date(f.date);
         return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          data: forecast.map(f => f.predictedCo2eKg),
          label: 'Predicted CO2e (kg)',
          borderColor: '#6366f1', // indigo
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          borderDash: [5, 5] // Dashed line to indicate prediction
        }
      ]
    };
  }
}
