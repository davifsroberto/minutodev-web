import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ProblemSource {
  readonly label: string;
}

@Component({
  selector: 'app-landing-problem',
  templateUrl: './landing-problem.component.html',
  styleUrl: './landing-problem.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProblemComponent {
  protected readonly sources: readonly ProblemSource[] = [
    { label: 'Blogs' },
    { label: 'GitHub' },
    { label: 'Newsletters' },
    { label: 'LinkedIn' },
    { label: 'Comunidades' },
    { label: 'Vídeos' },
  ];
}
