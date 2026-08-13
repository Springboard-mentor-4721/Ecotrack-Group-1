import { Pipe, PipeTransform } from '@angular/core';
import { EcoScoreDesignService, EcoScoreTokens } from '../services/eco-score-design.service';

@Pipe({
  name: 'ecoScoreColor',
  standalone: true
})
export class EcoScoreColorPipe implements PipeTransform {

  constructor(private designService: EcoScoreDesignService) {}

  transform(score: number | null | undefined, property: keyof EcoScoreTokens = 'primary'): string {
    const tokens = this.designService.getTokens(score);
    return tokens[property];
  }
}
