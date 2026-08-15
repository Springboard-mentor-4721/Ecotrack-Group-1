import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../../../../services/ai.service';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { AiInsightsResponse } from '../../../../models/ai-models';
import { HttpErrorResponse } from '@angular/common/http';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { LucideAngularModule, Hexagon, RefreshCw, Clock, AlertCircle, TrendingUp, Target, Lightbulb } from 'lucide-angular';

@Component({
  selector: 'app-unified-insights-panel',
  standalone: true,
  imports: [CommonModule, AiSkeletonLineComponent, LucideAngularModule],
  templateUrl: './unified-insights-panel.html',
  styleUrl: './unified-insights-panel.css'
})
export class UnifiedInsightsPanelComponent implements OnInit, OnDestroy {

  state = signal<AiFeatureState<AiInsightsResponse>>({
    loading: false,
    data: null,
    error: null,
    empty: true
  });

  rateLimited = signal(false);
  retryAfterSeconds = signal(0);
  private intervalId: any;

  HexagonIcon = Hexagon;
  RefreshCwIcon = RefreshCw;
  ClockIcon = Clock;
  AlertCircleIcon = AlertCircle;
  TrendingUpIcon = TrendingUp;
  TargetIcon = Target;
  LightbulbIcon = Lightbulb;

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    // Phase E: "Call only GET /api/dashboard/ai/insights. This endpoint MUST NOT generate AI."
    this.state.update(s => ({ ...s, loading: true }));
    this.aiService.getLatestInsights().subscribe({
      next: (res) => {
        if (res && res.summary) {
          this.state.set({ loading: false, data: res, error: null, empty: false });
        } else {
          // No content means no cached insight
          this.state.set({ loading: false, data: null, error: null, empty: true });
        }

      },
      error: (err: HttpErrorResponse) => {
        this.state.set({ loading: false, data: null, error: 'AI Insights are currently unavailable.', empty: true });

      }
    });
  }

  generateInsights(): void {
    if (this.state().loading || this.rateLimited()) return;

    this.state.update(s => ({ ...s, loading: true }));
    this.state.update(s => ({ ...s, error: null }));
    this.rateLimited.set(false);

    this.aiService.generateInsights().subscribe({
      next: (res) => {
        this.state.set({ loading: false, data: res, error: null, empty: false });

      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          this.rateLimited.set(true);
          this.retryAfterSeconds.set(err.error?.retryAfterSeconds || 60);
          this.state.set({ loading: false, data: this.state().data, error: 'AI request limit reached.', empty: this.state().data == null });
          this.startCountdown();
        } else {
          this.state.set({ loading: false, data: this.state().data, error: 'Failed to generate insights. Please try again.', empty: this.state().data == null });
        }

      }
    });
  }

  private startCountdown(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.retryAfterSeconds.update(v => v - 1);
      if (this.retryAfterSeconds() <= 0) {
        this.rateLimited.set(false);
        this.state.update(s => ({ ...s, error: null }));
        clearInterval(this.intervalId);
      }

    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
