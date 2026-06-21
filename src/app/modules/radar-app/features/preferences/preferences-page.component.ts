import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import { InterestsService } from '@app/core/interests/interests.service';

@Component({
  selector: 'app-preferences-page',
  templateUrl: './preferences-page.component.html',
  styleUrl: './preferences-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPageComponent {
  private readonly interests = inject(InterestsService);

  protected readonly catalog = this.interests.catalog;
  protected readonly mine = this.interests.mine;

  protected readonly skeleton = [0, 1, 2, 3, 4, 5];

  // Seleção local; reinicia a partir dos interesses do usuário sempre que eles
  // (re)carregam — carga inicial e após salvar —, mas é editável nos toggles.
  protected readonly selected = linkedSignal<Set<string>>(
    () => new Set(this.mine.hasValue() ? this.mine.value().interests : []),
  );

  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly saved = signal(false);

  protected readonly loading = computed(
    () => this.catalog.isLoading() || this.mine.isLoading(),
  );

  protected readonly loadError = computed(
    () =>
      !this.loading() &&
      (this.catalog.status() === 'error' || this.mine.status() === 'error'),
  );

  protected readonly ready = computed(
    () => !this.loading() && !this.loadError() && this.catalog.hasValue(),
  );

  protected readonly selectedCount = computed(() => this.selected().size);

  protected isChecked(slug: string): boolean {
    return this.selected().has(slug);
  }

  protected onToggle(slug: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    // Editar a seleção invalida o feedback do último save (sucesso ou erro).
    this.saved.set(false);
    this.saveError.set(false);

    this.selected.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(slug);
      } else {
        next.delete(slug);
      }
      return next;
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.save();
  }

  protected retry(): void {
    this.catalog.reload();
    this.mine.reload();
  }

  private async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.saved.set(false);

    try {
      await this.interests.save([...this.selected()]);
      this.saved.set(true);
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
