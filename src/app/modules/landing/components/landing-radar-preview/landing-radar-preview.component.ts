import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { toRadarItems } from '../../models/radar.model';
import { RadarItem } from '../../models/radar-item.model';
import { RadarService } from '../../services/radar.service';

@Component({
  selector: 'app-landing-radar-preview',
  templateUrl: './landing-radar-preview.component.html',
  styleUrl: './landing-radar-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingRadarPreviewComponent {
  private readonly radar = inject(RadarService);

  /** Placeholder rows for the loading skeleton — mirrors the four-card layout. */
  protected readonly skeletonRows = [0, 1, 2, 3];

  // `value()` throws while the resource is in an error state, so only read it
  // when a value is actually present (resolved); otherwise treat it as absent.
  private readonly briefing = computed(() =>
    this.radar.today.hasValue() ? this.radar.today.value() : undefined,
  );

  /** Up to four live cards derived from the briefing (empty until resolved). */
  readonly items = computed<RadarItem[]>(() => {
    const briefing = this.briefing();
    return briefing ? toRadarItems(briefing) : [];
  });

  /** Real read-time from the briefing; 0 while unresolved (the line is hidden then). */
  readonly estimatedMinutes = computed(
    () => this.briefing()?.estimatedReadTimeMinutes ?? 0,
  );

  /** Three mutually-exclusive states derived from the resource signals. */
  readonly loading = computed(() => this.radar.today.isLoading());

  readonly error = computed(
    () => !this.loading() && this.radar.today.status() === 'error',
  );

  /** Resolved briefing that produced zero cards (a genuinely quiet day). */
  readonly empty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.briefing() !== undefined &&
      this.items().length === 0,
  );

  /** Resolved briefing with at least one card. */
  readonly resolved = computed(() => this.items().length > 0);

  protected retry(): void {
    this.radar.today.reload();
  }
}
