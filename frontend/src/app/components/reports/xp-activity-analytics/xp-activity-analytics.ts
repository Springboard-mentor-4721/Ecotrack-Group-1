import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { XpActivityPageDTO } from '../../../models/report.models';
import { LucideAngularModule, Flame, Info, ChevronLeft, ChevronRight, Leaf, Target, Trophy, Calendar, Medal, Plus, RefreshCw, Trash2, CheckCircle, Star } from 'lucide-angular';
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
  Trash2Icon = Trash2;
  CheckCircleIcon = CheckCircle;
  StarIcon = Star;
  
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
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly Star = Star;

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

  getDisplayLabel(source: string, fallback: string): string {
    switch (source) {
      case 'CARBON_ENTRY': return 'Carbon activity logged';
      case 'GOAL_COMPLETED': return 'Goal completed';
      case 'CHALLENGE_COMPLETED': return 'Challenge completed';
      case 'STREAK_BONUS': return 'Streak bonus';
      case 'DAILY_LOGIN': return 'Daily login';
      case 'BADGE_BONUS': return 'Badge unlocked';
      case 'CARBON_ENTRY_DELETED': return 'Carbon activity removed';
      case 'GOAL_DELETED': return 'Goal removed';
      default: return fallback && fallback.trim() !== '' ? fallback : 'Activity update';
    }
  }

  getIconForSource(source: string): any {
    switch(source) {
      case 'CARBON_ENTRY': return this.Leaf;
      case 'GOAL_COMPLETED': return this.CheckCircle;
      case 'CHALLENGE_COMPLETED': return this.Trophy;
      case 'STREAK_BONUS': return this.Flame;
      case 'DAILY_LOGIN': return this.Calendar;
      case 'BADGE_BONUS': return this.Medal;
      case 'CARBON_ENTRY_DELETED':
      case 'GOAL_DELETED': return this.Trash2;
      default: return this.Info;
    }
  }
  
  getColorForSource(source: string, amount: number): string {
    if (amount < 0) {
      return 'text-red-500 bg-red-50';
    }
    switch(source) {
      case 'CARBON_ENTRY': return 'text-emerald-500 bg-emerald-50';
      case 'GOAL_COMPLETED': return 'text-emerald-500 bg-emerald-50';
      case 'CHALLENGE_COMPLETED': return 'text-indigo-500 bg-indigo-50';
      case 'STREAK_BONUS': return 'text-amber-500 bg-amber-50';
      case 'DAILY_LOGIN': return 'text-blue-500 bg-blue-50';
      case 'BADGE_BONUS': return 'text-amber-500 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }
}
