import { Injectable } from '@angular/core';

import { delay, map, Observable, of } from 'rxjs';

import { WaitlistSubmission } from '../models/waitlist.model';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  /**
   * Registra um e-mail na lista de espera.
   *
   * A V1 não possui backend: este método simula uma resposta bem-sucedida e é
   * o único ponto de integração para uma futura chamada HTTP. Para integrar,
   * basta substituir o corpo por:
   *   `return this.http.post<void>('/api/waitlist', submission);`
   */
  join(submission: WaitlistSubmission): Observable<void> {
    return of(submission).pipe(
      delay(600),
      map(() => undefined),
    );
  }
}
