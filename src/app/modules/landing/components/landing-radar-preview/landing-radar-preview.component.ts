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

  protected readonly skeletonRows = [0, 1, 2, 3];

  private readonly briefing = computed(() =>
    this.radar.today.hasValue() ? this.radar.today.value() : undefined,
  );

  readonly items = computed<RadarItem[]>(() => {
    const briefing = this.briefing();
    return briefing ? toRadarItems(briefing) : [];
  });

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
      this.items().length === 0,
  );

  readonly resolved = computed(() => this.items().length > 0);

  protected retry(): void {
    this.radar.today.reload();
  }
}
