import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { 
  LucideAngularModule, 
  Target, Activity, CheckCircle, Clock, Footprints, Car, Leaf, Zap, Recycle, 
  Droplets, UtensilsCrossed, ShoppingCart, Plane, EllipsisVertical, X, Trophy, 
  Plus, Award, Flame, Lightbulb, TrendingUp, BadgeCheck, Hourglass, BarChart3,
  ChartColumn, CalendarDays, Pencil, Trash2, CircleDashed, History, Calendar,
  ShieldCheck, Bell, Search, SlidersHorizontal, ChevronsLeft, ChevronsRight,
  ArrowUpDown, Save, AlertCircle, LayoutDashboard, NotebookPen, FileBarChart2, User, Shield
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Target, Activity, CheckCircle, Clock, Footprints, Car, Leaf, Zap, Recycle,
        Droplets, UtensilsCrossed, ShoppingCart, Plane, EllipsisVertical, X, Trophy,
        Plus, Award, Flame, Lightbulb, TrendingUp, BadgeCheck, Hourglass, BarChart3,
        ChartColumn, CalendarDays, Pencil, Trash2, CircleDashed, History, Calendar,
        ShieldCheck, Bell, Search, SlidersHorizontal, ChevronsLeft, ChevronsRight,
        ArrowUpDown, Save, AlertCircle, LayoutDashboard, NotebookPen, FileBarChart2, User, Shield
      })
    )
  ]
};
