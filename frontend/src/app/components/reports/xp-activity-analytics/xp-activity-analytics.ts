import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { XpActivityPageDTO } from '../../../models/report.models';
import { LucideAngularModule, Flame, Info, ChevronLeft, ChevronRight, Leaf, Target, Trophy, Calendar, Medal, Plus, RefreshCw } from 'lucide-angular';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-xp-activity-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './xp-activity-analytics.html'
})
export class XpActivityAnalytics implements OnChanges {
  RefreshCwIcon = RefreshCw;
  PlusIcon = Plus;
  MedalIcon = Medal;
  CalendarIcon = Calendar;
  TrophyIcon = Trophy;
  TargetIcon = Target;
  LeafIcon = Leaf;
  ChevronRightIcon = ChevronRight;
  ChevronLeftIcon = ChevronLeft;
  InfoIcon = Info;
  FlameIcon = Flame;
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  data = signal<XpActivityPageDTO | null>(null);
  isLoading = signal(true);
  errorMsg = signal('');
  currentPage = signal(0);
  pageSize: number = 10;

  readonly Flame = Flame;
  readonly Info = Info;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Leaf = Leaf;
  readonly Target = Target;
  readonly Trophy = Trophy;
  readonly Calendar = Calendar;
  readonly Medal = Medal;
  readonly Plus = Plus;
  readonly RefreshCw = RefreshCw;

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.currentPage.set(0);
      this.loadData();
    }
  }

  loadData(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoading.set(true);
    this.errorMsg.set('');
    
    this.reportService.getXpActivityReport(this.startDate, this.endDate, this.currentPage(), this.pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
      next: (res) => {
        this.data.set(res);
      },
      error: (err) => {
        console.error('Error fetching XP activity', err);
        this.errorMsg.set('We couldn\'t retrieve your XP history. Please try again.');
      }
    });
  }

  nextPage(): void {
    const currentData = this.data();
    if (currentData && currentData.hasNext) {
      this.currentPage.update(p => p + 1);
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadData();
    }
  }

  getIconForSource(source: string): any {
    switch(source) {
      case 'CARBON_ENTRY': return this.Leaf;
      case 'GOAL_COMPLETED': return this.Target;
      case 'CHALLENGE_COMPLETED': return this.Trophy;
      case 'STREAK_BONUS': return this.Flame;
      case 'DAILY_LOGIN': return this.Calendar;
      case 'BADGE_BONUS': return this.Medal;
      default: return this.Plus;
    }
  }
  
  getColorForSource(source: string): string {
    switch(source) {
      case 'CARBON_ENTRY': return 'text-green-500 bg-green-50';
      case 'GOAL_COMPLETED': return 'text-blue-500 bg-blue-50';
      case 'CHALLENGE_COMPLETED': return 'text-purple-500 bg-purple-50';
      case 'STREAK_BONUS': return 'text-orange-500 bg-orange-50';
      case 'DAILY_LOGIN': return 'text-gray-500 bg-gray-50';
      case 'BADGE_BONUS': return 'text-amber-500 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }
}
