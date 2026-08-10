import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RecommendationService } from '../../../services/recommendation.service';
import { AiService } from '../../../services/ai.service';
import { Recommendation } from '../../../models/recommendation.models';
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
  recommendations: Recommendation[] = [];
  parsedRecommendations: any[] = [];
  isLoading = false;
  isGenerating = false;
  errorMessage = '';
  
  rateLimited = false;
  retryAfterSeconds = 0;
  private intervalId: any;

  activeTab: 'recommendations' | 'history' = 'recommendations';

  // History State
  historyItems: any[] = [];
  isHistoryLoading = false;
  historyError = '';
  historyFilter: string = 'ALL';
  historyPage = 0;
  historyTotalPages = 0;
  historyPageSize = 10;
  selectedHistoryItem: any = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRecommendations(this.currentPage);
  }

  switchTab(tab: 'recommendations' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history' && this.historyItems.length === 0) {
      this.loadHistory(0);
    }
  }

  loadHistory(page: number): void {
    this.isHistoryLoading = true;
    this.historyError = '';
    this.aiService.getAiHistory(this.historyFilter, page, this.historyPageSize)
      .pipe(finalize(() => {
        this.isHistoryLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.historyItems = res.items.map((item: any) => {
             if (item.contentJson) {
                try { item.parsedContent = JSON.parse(item.contentJson); } catch (e) {}
             }
             return item;
          });
          this.historyPage = res.currentPage;
          this.historyTotalPages = res.totalPages;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.historyError = 'Failed to load AI history.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  onHistoryFilterChange(): void {
    this.loadHistory(0);
  }

  onHistoryPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.historyTotalPages) {
      this.loadHistory(newPage);
    }
  }

  onHistoryPageSizeChange(): void {
    this.historyPage = 0;
    this.loadHistory(0);
  }

  openDetails(item: any): void {
    this.selectedHistoryItem = item;
  }

  closeDetails(): void {
    this.selectedHistoryItem = null;
  }

  loadRecommendations(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.recommendationService.getRecommendations(page, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.recommendations = response.content;
          this.parsedRecommendations = this.recommendations.map(rec => {
             const parts = rec.recommendation.split('\n\nWhy this is recommended: ');
             return {
                ...rec,
                mainText: parts[0],
                rationale: parts.length > 1 ? parts[1] : null
             };
          });
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load recommendations. Please try again later.';
          console.error('Error fetching recommendations', err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadRecommendations(newPage);
    }
  }

  generateRecommendations(): void {
    if (this.isGenerating || this.rateLimited) return;

    this.isGenerating = true;
    this.errorMessage = '';
    this.rateLimited = false;
    
    this.recommendationService.generate()
      .pipe(finalize(() => {
        this.isGenerating = false;
        this.cdr.detectChanges();
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
              this.rateLimited = true;
              this.retryAfterSeconds = serverRetry;
              this.errorMessage = 'AI request limit reached.';
              this.startCountdown();
            } else {
              this.errorMessage = 'Recommendation generation is temporarily unavailable. Please try again later.';
            }
          } else {
            this.errorMessage = 'Failed to generate recommendations.';
            console.error('Error generating recommendations', err);
          }
        }
      });
  }

  private startCountdown(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      this.retryAfterSeconds--;
      if (this.retryAfterSeconds <= 0) {
        this.rateLimited = false;
        this.errorMessage = '';
        clearInterval(this.intervalId);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
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
