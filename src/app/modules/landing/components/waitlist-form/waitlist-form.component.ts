import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { WaitlistStatus } from '../../models/waitlist.model';

@Component({
  selector: 'app-waitlist-form',
  imports: [ReactiveFormsModule],
  templateUrl: './waitlist-form.component.html',
  styleUrl: './waitlist-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitlistFormComponent {
  readonly status = input<WaitlistStatus>('idle');
  readonly submitted = output<string>();

  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly form = new FormGroup({ email: this.email });

  protected readonly submitLabel = computed<string>(() => {
    switch (this.status()) {
      case 'loading':
        return 'Enviando…';
      case 'success':
        return 'Tudo certo!';
      default:
        return 'Entrar na lista';
    }
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.email.value);
  }
}
