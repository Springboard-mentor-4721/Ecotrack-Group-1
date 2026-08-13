import { Injectable } from '@angular/core';

export interface EcoScoreTokens {
  status: string;
  primary: string;
  text: string;
  background: string;
  border: string;
  glow: string;
}

@Injectable({
  providedIn: 'root'
})
export class EcoScoreDesignService {

  getTokens(score: number | null | undefined): EcoScoreTokens {
    if (score === null || score === undefined) {
      return {
        status: 'Unknown',
        primary: 'text-slate-500',
        text: 'text-slate-600',
        background: 'bg-slate-100',
        border: 'border-slate-200',
        glow: 'shadow-slate-500/20'
      };
    }

    if (score >= 80) {
      // A+ equivalent: Excellent
      return {
        status: 'Excellent',
        primary: 'text-emerald-600',
        text: 'text-emerald-700',
        background: 'bg-emerald-50',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-500/20'
      };
    }

    if (score >= 60) {
      // A equivalent: Good
      return {
        status: 'Good',
        primary: 'text-teal-500',
        text: 'text-teal-700',
        background: 'bg-teal-50',
        border: 'border-teal-200',
        glow: 'shadow-teal-500/20'
      };
    }

    if (score >= 40) {
      // B equivalent: Moderate
      return {
        status: 'Moderate',
        primary: 'text-amber-500',
        text: 'text-amber-700',
        background: 'bg-amber-50',
        border: 'border-amber-200',
        glow: 'shadow-amber-500/20'
      };
    }

    // C equivalent: Needs Improvement
    return {
      status: 'Needs Improvement',
      primary: 'text-orange-500',
      text: 'text-orange-700',
      background: 'bg-orange-50',
      border: 'border-orange-200',
      glow: 'shadow-orange-500/20'
    };
  }
}
