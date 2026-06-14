import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ContentEnrichment } from '@app/core/content/content-enrichment.model';
import { ContentEnrichmentService } from '@app/core/content/content-enrichment.service';

@Component({
  selector: 'app-content-detail-page',
  imports: [RouterLink],
  templateUrl: './content-detail-page.component.html',
  styleUrl: './content-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly enrichmentService = inject(ContentEnrichmentService);

  private readonly params = toSignal(this.route.paramMap);
  readonly id = computed(() => this.params()?.get('id') ?? null);

  readonly enrichment = this.enrichmentService.loadById(this.id);

  readonly data = computed<ContentEnrichment | undefined>(() =>
    this.enrichment.hasValue() ? this.enrichment.value() : undefined,
  );

  readonly loading = computed(() => this.enrichment.isLoading());

  readonly error = computed(
    () => !this.loading() && this.enrichment.status() === 'error',
  );

  readonly title = computed(() => this.data()?.translatedTitle ?? null);

  readonly keyPoints = computed(() => this.data()?.keyPoints ?? []);

  readonly isEmpty = computed(() => {
    const data = this.data();

    if (data === undefined) return false;

    return (
      !data.shortSummary &&
      !data.briefContent &&
      !data.whyItMatters &&
      data.keyPoints.length === 0
    );
  });

  protected retry(): void {
    this.enrichment.reload();
  }
}
