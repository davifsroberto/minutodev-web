import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RadarItem } from '../../models/radar-item.model';

@Component({
  selector: 'app-landing-radar-preview',
  templateUrl: './landing-radar-preview.component.html',
  styleUrl: './landing-radar-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingRadarPreviewComponent {
  readonly items = input.required<RadarItem[]>();
  readonly estimatedMinutes = input<number>(8);
}
