import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-rule-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rule-builder.html',
  styleUrl: './rule-builder.css'
})
export class RuleBuilder {
  @Input() availableSubcategories: any[] = [];
  @Input() allowedSubcategories: string[] = [];
  @Input() blockedSubcategories: string[] = [];

  @Output() allowedChanged = new EventEmitter<string[]>();
  @Output() blockedChanged = new EventEmitter<string[]>();

  selectAllowed(subName: string) {
    if (!this.allowedSubcategories.includes(subName)) {
      this.allowedSubcategories = [...this.allowedSubcategories, subName];
    }
    this.blockedSubcategories = this.blockedSubcategories.filter(s => s !== subName);
    this.emitChanges();
  }

  selectBlocked(subName: string) {
    if (!this.blockedSubcategories.includes(subName)) {
      this.blockedSubcategories = [...this.blockedSubcategories, subName];
    }
    this.allowedSubcategories = this.allowedSubcategories.filter(s => s !== subName);
    this.emitChanges();
  }

  removeAllowed(subName: string) {
    this.allowedSubcategories = this.allowedSubcategories.filter(s => s !== subName);
    this.emitChanges();
  }

  removeBlocked(subName: string) {
    this.blockedSubcategories = this.blockedSubcategories.filter(s => s !== subName);
    this.emitChanges();
  }

  private emitChanges() {
    this.allowedChanged.emit(this.allowedSubcategories);
    this.blockedChanged.emit(this.blockedSubcategories);
  }
}
