import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';

import { environment } from '@environments/environment';
import { ContentEnrichment } from './content-enrichment.model';

@Injectable({ providedIn: 'root' })
export class ContentEnrichmentService {
  private readonly endpoint = `${environment.apiBaseUrl}/contents`;

  loadById(
    id: Signal<string | null | undefined>,
  ): HttpResourceRef<ContentEnrichment | undefined> {
    return httpResource<ContentEnrichment>(() => {
      const value = id();

      return value ? `${this.endpoint}/${value}/enrichment` : undefined;
    });
  }
}
