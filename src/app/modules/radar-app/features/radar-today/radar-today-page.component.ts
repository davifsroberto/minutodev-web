import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { RadarBriefing } from '@app/core/radar/radar.model';
import { RadarService } from '@app/core/radar/radar.service';
import { CLOCK } from '@app/core/time/clock';
import { LocalDateUtil } from '@app/core/time/local-date.util';
import {
  RadarTodaySection,
  toRadarTodaySections,
} from '../../models/radar-today.model';
import { RadarTodaySectionComponent } from './components/radar-today-section/radar-today-section.component';

@Component({
  selector: 'app-radar-today-page',
  imports: [RadarTodaySectionComponent],
  templateUrl: './radar-today-page.component.html',
  styleUrl: './radar-today-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTodayPageComponent {
  private readonly radar = inject(RadarService);
  private readonly now = inject(CLOCK);

  protected readonly skeletonSections = [0, 1, 2, 3];
  protected readonly skeletonItems = [0, 1, 2];

  readonly briefing = computed<RadarBriefing | undefined>(() =>
    this.radar.today.hasValue() ? this.radar.today.value() : undefined,
  );

  readonly sections = computed<RadarTodaySection[]>(() => {
    const briefing = this.briefing();
    return briefing ? toRadarTodaySections(briefing) : [];
  });

  readonly isFallback = computed(() => {
    const briefing = this.briefing();
    return (
      briefing !== undefined &&
      briefing.date !== LocalDateUtil.toLocalDateParam(this.now())
    );
  });

  readonly eyebrow = computed(() =>
    this.isFallback() ? 'Último briefing disponível' : 'Radar de Hoje',
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
      !this.sections().length,
  );

  readonly resolved = computed(() => !!this.sections().length);

  protected retry(): void {
    this.radar.today.reload();
  }
}
