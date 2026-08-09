import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'challengeStatusLabel',
  standalone: true
})
export class ChallengeStatusLabelPipe implements PipeTransform {
  private labelMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'WITHIN_BUDGET': 'On Budget',
    'EXCEEDED': 'Failed',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'DROPPED': 'Dropped Out',
    'UPCOMING': 'Upcoming',
    'CLOSED': 'Ended',
    'PENDING': 'Pending Approval',
    'ARCHIVED': 'Archived'
  };

  transform(status: string): string {
    return this.labelMap[status] || status;
  }
}
