import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RadarTodaySection } from '../../../../models/radar-today.model';
import { RadarContentCardComponent } from '../radar-content-card/radar-content-card.component';

@Component({
  selector: 'app-radar-today-section',
  imports: [RadarContentCardComponent],
  templateUrl: './radar-today-section.component.html',
  styleUrl: './radar-today-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTodaySectionComponent {
  readonly section = input.required<RadarTodaySection>();
}
