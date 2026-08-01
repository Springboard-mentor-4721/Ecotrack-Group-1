import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chip-selector',
  imports: [],
  templateUrl: './chip-selector.html',
  styleUrl: './chip-selector.css',
})
export class ChipSelector {}
