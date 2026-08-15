import { Component, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RecommendationService } from '../../../services/recommendation.service';
import { AiService } from '../../../services/ai.service';
import { CarbonEntryService } from '../../../services/carbon-entry.service';
import { Recommendation } from '../../../models/recommendation.models';
import { AiFeatureState } from '../../../models/ai-feature-state.model';
import { JournalSummaryResponse } from '../../../models/ai-models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Lightbulb, Leaf, Zap, RefreshCw, History, FileText, Activity, AlertTriangle, Filter, Cpu, X } from 'lucide-angular';
import { AiSkeletonLineComponent } from '../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';

@Component({
  selector: 'app-recommendation-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AiSkeletonLineComponent],
  templateUrl: './recommendation-page.component.html',
  styleUrls: ['./recommendation-page.component.css']
})
export class RecommendationPageComponent implements OnInit, OnDestroy {
  recommendations = signal<Recommendation[]>([]);
  parsedRecommendations = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  rateLimited = signal<boolean>(false);
  retryAfterSeconds = signal<number>(0);
  private intervalId: any;

  activeTab = signal<'journal_summary' | 'recommendations' | 'history'>('journal_summary');

  // Journal Summary State
  journalSummaryState = signal<AiFeatureState<JournalSummaryResponse>>({ loading: false, data: null, error: null });
  journalSummaryRateLimited = signal<boolean>(false);
  journalSummaryRetryAfter = signal<number>(0);
  private journalIntervalId: any;

  // History State
  historyItems = signal<any[]>([]);
  isHistoryLoading = signal<boolean>(false);
  historyError = signal<string>('');
  historyFilter = signal<string>('ALL');
  historyPage = signal<number>(0);
  historyTotalPages = signal<number>(0);
  historyPageSize = signal<number>(10);
  selectedHistoryItem = signal<any>(null);

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  // Icons
  LightbulbIcon = Lightbulb;
  LeafIcon = Leaf;
  ZapIcon = Zap;
  RefreshCwIcon = RefreshCw;
  HistoryIcon = History;
  FileTextIcon = FileText;
  ActivityIcon = Activity;
  AlertTriangleIcon = AlertTriangle;
  FilterIcon = Filter;
  CpuIcon = Cpu;
  XIcon = X;

  constructor(
    private recommendationService: RecommendationService,
    private aiService: AiService,
    private carbonEntryService: CarbonEntryService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations(this.currentPage());
    this.loadJournalSummary();
  }

  switchTab(tab: 'journal_summary' | 'recommendations' | 'history'): void {
    this.activeTab.set(tab);
    if (tab === 'history' && this.historyItems().length === 0) {
      this.loadHistory(0);
    }
    if (tab === 'journal_summary' && !this.journalSummaryState().data && !this.journalSummaryState().loading && !this.journalSummaryState().error) {
      this.loadJournalSummary();
    }
  }

  loadHistory(page: number): void {
    this.isHistoryLoading.set(true);
    this.historyError.set('');
    this.aiService.getAiHistory(this.historyFilter(), page, this.historyPageSize())
      .pipe(finalize(() => {
        this.isHistoryLoading.set(false);
      }))
      .subscribe({
        next: (res) => {
          this.historyItems.set(res.items.map((item: any) => {
             if (item.contentJson) {
                try { item.parsedContent = JSON.parse(item.contentJson); } catch (e) {}
             }
             return item;
          }));
          this.historyPage.set(res.currentPage);
          this.historyTotalPages.set(res.totalPages);
        },
        error: (err) => {
          this.historyError.set('Failed to load AI history.');
          console.error(err);
        }
      });
  }

  onHistoryFilterChange(): void {
    this.loadHistory(0);
  }

  onHistoryPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.historyTotalPages()) {
      this.loadHistory(newPage);
    }
  }

  onHistoryPageSizeChange(): void {
    this.historyPage.set(0);
    this.loadHistory(0);
  }

  openDetails(item: any): void {
    this.selectedHistoryItem.set(item);
  }

  closeDetails(): void {
    this.selectedHistoryItem.set(null);
  }

  loadRecommendations(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.recommendationService.getRecommendations(page, this.pageSize())
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (response) => {
          this.recommendations.set(response.content);
          this.parsedRecommendations.set(this.recommendations().map(rec => {
             const parts = rec.recommendation.split('\n\nWhy this is recommended: ');
             return {
                ...rec,
                mainText: parts[0],
                rationale: parts.length > 1 ? parts[1] : null
             };
          }));
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (err) => {
          this.errorMessage.set('Failed to load recommendations. Please try again later.');
          console.error('Error fetching recommendations', err);
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.loadRecommendations(newPage);
    }
  }

  generateRecommendations(): void {
    if (this.isGenerating() || this.rateLimited()) return;

    this.isGenerating.set(true);
    this.errorMessage.set('');
    this.rateLimited.set(false);
    
    this.recommendationService.generate()
      .pipe(finalize(() => {
        this.isGenerating.set(false);
      }))
      .subscribe({
        next: () => {
          // Reload from first page after generating new recommendations
          this.loadRecommendations(0);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 429) {
            const serverRetry = err.error?.retryAfterSeconds;
            if (serverRetry) {
              this.rateLimited.set(true);
              this.retryAfterSeconds.set(serverRetry);
              this.errorMessage.set('AI request limit reached.');
              this.startCountdown();
            } else {
              this.errorMessage.set('Recommendation generation is temporarily unavailable. Please try again later.');
            }
          } else {
            this.errorMessage.set('Failed to generate recommendations.');
            console.error('Error generating recommendations', err);
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
        this.errorMessage.set('');
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.journalIntervalId) clearInterval(this.journalIntervalId);
  }

  loadJournalSummary(): void {
    this.journalSummaryState.set({ loading: true, data: null, error: null, empty: true });
    this.carbonEntryService.getJournalSummary().subscribe({
      next: (res) => {
        if (res && res.summaryText) {
          this.journalSummaryState.set({ loading: false, data: res, error: null, empty: false });
        } else {
          this.journalSummaryState.set({ loading: false, data: null, error: null, empty: true });
        }
      },
      error: () => {
        this.journalSummaryState.set({ loading: false, data: null, error: 'AI Summary unavailable', empty: true });
      }
    });
  }

  generateJournalSummary(): void {
    if (this.journalSummaryState().loading || this.journalSummaryRateLimited()) return;

    this.journalSummaryState.set({ ...this.journalSummaryState(), loading: true, error: null });
    this.journalSummaryRateLimited.set(false);
    
    this.carbonEntryService.generateJournalSummary().subscribe({
      next: (res) => {
        this.journalSummaryState.set({ loading: false, data: res, error: null, empty: false });
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          const serverRetry = err.error?.retryAfterSeconds;
          if (serverRetry) {
            this.journalSummaryRateLimited.set(true);
            this.journalSummaryRetryAfter.set(serverRetry);
            this.journalSummaryState.set({ loading: false, data: this.journalSummaryState().data, error: 'AI request limit reached.', empty: this.journalSummaryState().data == null });
            this.startJournalCountdown();
          } else {
            this.journalSummaryState.set({ loading: false, data: this.journalSummaryState().data, error: 'Failed to generate summary.', empty: this.journalSummaryState().data == null });
          }
        } else {
          this.journalSummaryState.set({ loading: false, data: this.journalSummaryState().data, error: 'Failed to generate summary.', empty: this.journalSummaryState().data == null });
        }
      }
    });
  }

  private startJournalCountdown(): void {
    if (this.journalIntervalId) clearInterval(this.journalIntervalId);
    
    this.journalIntervalId = setInterval(() => {
      this.journalSummaryRetryAfter.update(v => v - 1);
      if (this.journalSummaryRetryAfter() <= 0) {
        this.journalSummaryRateLimited.set(false);
        this.journalSummaryState.set({ ...this.journalSummaryState(), error: null });
        clearInterval(this.journalIntervalId);
      }
    }, 1000);
  }

  markAsRead(recommendation: Recommendation): void {
    if (recommendation.isRead) return;
    
    this.recommendationService.markAsRead(recommendation.id)
      .subscribe({
        next: () => {
          recommendation.isRead = true;
        },
        error: (err) => {
          console.error('Failed to mark recommendation as read', err);
        }
      });
  }

  getCategoryColor(category: string): string {
    const cat = category?.toUpperCase() || '';
    if (cat.includes('ENERGY') || cat.includes('ELECTRICITY')) return 'text-warning';
    if (cat.includes('TRANSPORT')) return 'text-primary';
    if (cat.includes('WASTE')) return 'text-danger';
    if (cat.includes('FOOD')) return 'text-success';
    if (cat.includes('FUEL')) return 'text-danger';
    if (cat.includes('WATER')) return 'text-info';
    if (cat.includes('SHOPPING')) return 'text-secondary';
    return 'text-teal';
  }
}
