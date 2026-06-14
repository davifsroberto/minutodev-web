import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RadarTodaySection } from '../../../../models/radar-today.model';

@Component({
  selector: 'app-radar-today-section',
  templateUrl: './radar-today-section.component.html',
  styleUrl: './radar-today-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTodaySectionComponent {
  readonly section = input.required<RadarTodaySection>();
}
