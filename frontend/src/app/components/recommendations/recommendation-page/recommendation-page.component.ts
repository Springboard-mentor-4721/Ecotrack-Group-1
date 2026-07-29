import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationService } from '../../../services/recommendation.service';
import { Recommendation } from '../../../models/recommendation.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Lightbulb, Leaf, Zap, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-recommendation-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recommendation-page.component.html',
  styleUrls: ['./recommendation-page.component.css']
})
export class RecommendationPageComponent implements OnInit {
  recommendations: Recommendation[] = [];
  isLoading = false;
  isGenerating = false;
  errorMessage = '';

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

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    this.loadRecommendations(this.currentPage);
  }

  loadRecommendations(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.recommendationService.getRecommendations(page, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.recommendations = response.content;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load recommendations. Please try again later.';
          console.error('Error fetching recommendations', err);
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadRecommendations(newPage);
    }
  }

  generateRecommendations(): void {
    this.isGenerating = true;
    this.errorMessage = '';
    
    this.recommendationService.generate()
      .pipe(finalize(() => this.isGenerating = false))
      .subscribe({
        next: () => {
          // Reload from first page after generating new recommendations
          this.loadRecommendations(0);
        },
        error: (err) => {
          this.errorMessage = 'Failed to generate recommendations.';
          console.error('Error generating recommendations', err);
        }
      });
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
    if (cat.includes('ENERGY')) return 'text-warning';
    if (cat.includes('TRANSPORT')) return 'text-primary';
    if (cat.includes('WASTE')) return 'text-danger';
    if (cat.includes('FOOD')) return 'text-success';
    return 'text-info';
  }
}
