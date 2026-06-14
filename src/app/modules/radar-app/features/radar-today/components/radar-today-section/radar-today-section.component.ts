import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RadarTodaySection } from '../../../../models/radar-today.model';
import { RadarThumbComponent } from '../radar-thumb/radar-thumb.component';

@Component({
  selector: 'app-radar-today-section',
  imports: [RouterLink, RadarThumbComponent],
  templateUrl: './radar-today-section.component.html',
  styleUrl: './radar-today-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTodaySectionComponent {
  readonly section = input.required<RadarTodaySection>();
}
