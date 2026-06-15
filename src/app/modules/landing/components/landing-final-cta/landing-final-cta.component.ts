import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-final-cta',
  imports: [RouterLink],
  templateUrl: './landing-final-cta.component.html',
  styleUrl: './landing-final-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFinalCtaComponent {}
