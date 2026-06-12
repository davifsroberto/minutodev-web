import { TestBed } from '@angular/core/testing';

import { WaitlistFormComponent } from './waitlist-form.component';

describe('WaitlistFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitlistFormComponent],
    }).compileComponents();
  });

  it('shows the validation error and does not emit when submitting an empty form', async () => {
    const fixture = TestBed.createComponent(WaitlistFormComponent);
    await fixture.whenStable();

    let emitted: string | undefined;
    fixture.componentInstance.submitted.subscribe((value: string) => {
      emitted = value;
    });

    const el = fixture.nativeElement as HTMLElement;
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const error = el.querySelector('#waitlist-error');
    expect(error?.textContent).toContain('Informe um e-mail válido.');
    expect(emitted).toBeUndefined();
  });

  it('emits the typed email once when a valid email is submitted', async () => {
    const fixture = TestBed.createComponent(WaitlistFormComponent);
    await fixture.whenStable();

    const emitted: string[] = [];
    fixture.componentInstance.submitted.subscribe((value: string) => {
      emitted.push(value);
    });

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('#waitlist-email') as HTMLInputElement;
    input.value = 'dev@minutodev.com';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(emitted).toEqual(['dev@minutodev.com']);
  });

  it('disables the button and marks it busy while loading', async () => {
    const fixture = TestBed.createComponent(WaitlistFormComponent);
    fixture.componentRef.setInput('status', 'loading');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('Enviando…');
  });

  it('renders the success message when status is success', async () => {
    const fixture = TestBed.createComponent(WaitlistFormComponent);
    fixture.componentRef.setInput('status', 'success');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const status = el.querySelector('[role="status"]');

    expect(status?.textContent).toContain('Pronto! Você está na lista.');
  });
});
