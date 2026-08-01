import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeTemplate } from '../../models/challenge-ui.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-template-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-gallery.html',
  styleUrl: './template-gallery.css'
})
export class TemplateGallery {
  @Input() templates: ChallengeTemplate[] = [];
  @Input() selectedTemplate: ChallengeTemplate | null = null;
  @Output() templateSelected = new EventEmitter<ChallengeTemplate>();

  onSelect(template: ChallengeTemplate) {
    this.templateSelected.emit(template);
  }
}
