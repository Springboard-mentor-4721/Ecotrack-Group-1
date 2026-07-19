import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay, catchError, throwError, tap, finalize } from 'rxjs';
import { Goal, GoalProgressEntry } from '../interfaces/goal.interface';
import { MOCK_GOALS } from '../mock-data/goals.mock';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  // Replace these with actual API endpoints
  private readonly API_URL = '/api/goals';

  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  
  // State Signals
  public goalsSignal = signal<Goal[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  
  // Computed Signals for overview statistics
  public totalGoals = computed(() => this.goalsSignal().length);
  public goalsInProgress = computed(() => this.goalsSignal().filter(g => g.status === 'In Progress').length);
  public goalsCompleted = computed(() => this.goalsSignal().filter(g => g.status === 'Completed').length);
  public goalsPending = computed(() => this.goalsSignal().filter(g => g.status === 'Pending').length);

  constructor(private http: HttpClient) {}

  /**
   * Load all goals (simulated with mock data, ready for HTTP)
   * HTTP pattern: return this.http.get<Goal[]>(this.API_URL)
   */
  loadGoals(): Observable<Goal[]> {
    this.loading.set(true);
    this.error.set(null);
    
    // Simulating HTTP GET with delay
    return of([...MOCK_GOALS]).pipe(
      delay(800),
      tap(goals => {
        this.goalsSubject.next(goals);
        this.goalsSignal.set(goals);
      }),
      catchError(err => {
        this.error.set('Failed to load goals. Please try again.');
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Get a single goal
   * HTTP pattern: return this.http.get<Goal>(`${this.API_URL}/${id}`)
   */
  getGoalById(id: string): Observable<Goal | undefined> {
    const goal = this.goalsSubject.value.find(g => g.id === id);
    return of(goal).pipe(delay(200));
  }

  /**
   * Create new goal
   * HTTP pattern: return this.http.post<Goal>(this.API_URL, goalData)
   */
  createGoal(goalData: Partial<Goal>): Observable<Goal> {
    const newGoal: Goal = {
      ...goalData,
      id: 'g' + (this.goalsSubject.value.length + 1),
      createdDate: new Date().toISOString().split('T')[0],
      currentValue: 0,
      progressPercentage: 0,
      status: 'Pending',
      progressHistory: [],
      recentActivity: [`Created goal on ${new Date().toLocaleDateString()}`]
    } as Goal;
    
    return of(newGoal).pipe(
      delay(400),
      tap(createdGoal => {
        const currentGoals = this.goalsSubject.value;
        this.goalsSubject.next([...currentGoals, createdGoal]);
        this.goalsSignal.set([...currentGoals, createdGoal]);
      })
    );
  }

  /**
   * Update existing goal
   * HTTP pattern: return this.http.put<Goal>(`${this.API_URL}/${id}`, updates)
   */
  updateGoal(id: string, updates: Partial<Goal>): Observable<Goal> {
    const currentGoals = this.goalsSubject.value;
    const index = currentGoals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');

    const updatedGoal = { ...currentGoals[index], ...updates };
    
    return of(updatedGoal).pipe(
      delay(300),
      tap(goal => {
        const newGoals = [...currentGoals];
        newGoals[index] = goal;
        this.goalsSubject.next(newGoals);
        this.goalsSignal.set(newGoals);
      })
    );
  }

  /**
   * Delete goal
   * HTTP pattern: return this.http.delete<void>(`${this.API_URL}/${id}`)
   */
  deleteGoal(id: string): Observable<boolean> {
    return of(true).pipe(
      delay(300),
      tap(() => {
        const currentGoals = this.goalsSubject.value;
        const newGoals = currentGoals.filter(g => g.id !== id);
        this.goalsSubject.next(newGoals);
        this.goalsSignal.set(newGoals);
      })
    );
  }

  /**
   * Record progress
   * HTTP pattern: return this.http.post<Goal>(`${this.API_URL}/${id}/progress`, { value, note })
   */
  recordProgress(id: string, value: number, note: string = ''): Observable<Goal> {
    const currentGoals = this.goalsSubject.value;
    const goal = currentGoals.find(g => g.id === id);
    if (!goal) throw new Error('Goal not found');

    const newProgressEntry: GoalProgressEntry = {
      id: 'ph' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      value,
      note
    };

    const newCurrentValue = goal.currentValue + value;
    let newPercentage = Math.round((newCurrentValue / goal.targetValue) * 100);
    newPercentage = Math.min(newPercentage, 100);
    
    const newStatus = newPercentage >= 100 ? 'Completed' : 'In Progress';

    const updatedGoal: Goal = {
      ...goal,
      currentValue: newCurrentValue,
      progressPercentage: newPercentage,
      status: newStatus,
      progressHistory: [...goal.progressHistory, newProgressEntry],
      recentActivity: [`Updated progress on ${new Date().toLocaleDateString()}`, ...goal.recentActivity]
    };

    return this.updateGoal(id, updatedGoal);
  }
}
