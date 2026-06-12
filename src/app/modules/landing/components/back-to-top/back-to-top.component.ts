import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

/**
 * Floating "back to top" control. Anchors to `#topo`, so the scroll itself
 * works without JS and honours the global smooth-scroll (and reduced-motion)
 * settings. JS only toggles visibility once the user has scrolled past the
 * hero, keeping it out of the way until it's useful.
 */
@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class BackToTopComponent {
  /** Scroll distance (px) before the button reveals itself. */
  private static readonly REVEAL_AFTER = 480;

  private readonly document = inject(DOCUMENT);

  protected readonly visible = signal(false);

  protected onScroll(): void {
    const offset = this.document.defaultView?.scrollY ?? 0;
    this.visible.set(offset > BackToTopComponent.REVEAL_AFTER);
  }
}
