import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { RadarService } from '@app/core/radar/radar.service';
import { RadarHighlightCardComponent } from '@app/modules/radar-app/features/radar-today/components/radar-highlight-card/radar-highlight-card.component';
import {
  RadarTodayItem,
  toRadarTodaySections,
} from '@app/modules/radar-app/models/radar-today.model';

/**
 * Preview da Home dentro da landing. Reaproveita o card de destaque real do
 * Radar para parecer o produto em funcionamento, e o clique navega para o
 * briefing interno (`/app/content/:id`) — nunca para a fonte externa.
 */
@Component({
  selector: 'app-landing-radar-preview',
  imports: [RadarHighlightCardComponent],
  templateUrl: './landing-radar-preview.component.html',
  styleUrl: './landing-radar-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingRadarPreviewComponent {
  private readonly radar = inject(RadarService);

  private readonly briefing = computed(() =>
    this.radar.today.hasValue() ? this.radar.today.value() : undefined,
  );

  private readonly sections = computed(() => {
    const briefing = this.briefing();
    return briefing ? toRadarTodaySections(briefing) : [];
  });

  readonly highlight = computed<RadarTodayItem | null>(
    () => this.sections()[0]?.items[0] ?? null,
  );

  readonly estimatedMinutes = computed(
    () => this.briefing()?.estimatedReadTimeMinutes ?? 0,
  );

  readonly loading = computed(() => this.radar.today.isLoading());

  readonly error = computed(
    () => !this.loading() && this.radar.today.status() === 'error',
  );

  readonly empty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.briefing() !== undefined &&
      !this.highlight(),
  );

  readonly resolved = computed(() => !!this.highlight());

  protected retry(): void {
    this.radar.today.reload();
  }
}
