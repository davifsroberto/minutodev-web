import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RadarTodayItem } from '@app/core/radar/radar-view.model';
import { RadarThumbComponent } from '../radar-thumb/radar-thumb.component';

/**
 * Conteúdo destaque do dia (Sprint 5D-4.2): o card visualmente mais importante
 * da Home. Recebe um item já resolvido (maior score ou, na ausência, o primeiro
 * retornado) e leva à página de detalhe interna.
 */
@Component({
  selector: 'app-radar-highlight-card',
  imports: [RouterLink, RadarThumbComponent],
  templateUrl: './radar-highlight-card.component.html',
  styleUrl: './radar-highlight-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarHighlightCardComponent {
  readonly item = input.required<RadarTodayItem>();
}
