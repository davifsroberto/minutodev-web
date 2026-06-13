import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@environments/environment';
import { RadarBriefing } from '../models/radar.model';

@Injectable({ providedIn: 'root' })
export class RadarService {
  private readonly endpoint = `${environment.apiBaseUrl}/radar/today`;

  readonly today = httpResource<RadarBriefing>(() => this.endpoint);
}
