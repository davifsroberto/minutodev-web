import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RadarTodayItem } from '../../../../models/radar-today.model';
import { RadarThumbComponent } from '../radar-thumb/radar-thumb.component';

/**
 * Card de conteúdo do radar (thumbnail + badge + título + fonte) que navega para
 * o briefing interno (`/app/content/:id`). Compartilhado pela grade da Home
 * (RadarTodaySection) e pelo preview da landing — uma única fonte de layout.
 */
@Component({
  selector: 'app-radar-content-card',
  imports: [RouterLink, RadarThumbComponent],
  templateUrl: './radar-content-card.component.html',
  styleUrl: './radar-content-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarContentCardComponent {
  readonly item = input.required<RadarTodayItem>();
}
