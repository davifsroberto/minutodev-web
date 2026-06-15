import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RadarContentCardComponent } from '@app/core/radar/components/radar-content-card/radar-content-card.component';
import { RadarTodaySection } from '@app/core/radar/radar-view.model';

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
