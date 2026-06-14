import { httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '@environments/environment';
import { CLOCK } from '../../../core/time/clock';
import { LocalDateUtil } from '../../../core/time/local-date.util';
import { RadarBriefing } from '../models/radar.model';

@Injectable({ providedIn: 'root' })
export class RadarService {
  private readonly endpoint = `${environment.apiBaseUrl}/radar/today`;
  private readonly now = inject(CLOCK);

  readonly today = httpResource<RadarBriefing>(() => ({
    url: this.endpoint,
    params: { date: LocalDateUtil.toLocalDateParam(this.now()) },
  }));
}
