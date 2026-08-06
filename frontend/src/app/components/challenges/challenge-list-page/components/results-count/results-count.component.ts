import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-count',
  standalone: true,
  templateUrl: './results-count.component.html'
})
export class ResultsCountComponent {
  @Input() count = 0;
}
