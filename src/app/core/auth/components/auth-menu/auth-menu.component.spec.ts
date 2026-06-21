import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthStatus, AuthUser } from '../../auth.model';
import { AuthService } from '../../auth.service';
import { AuthMenuComponent } from './auth-menu.component';

describe('AuthMenuComponent', () => {
  let status: WritableSignal<AuthStatus>;
  let user: WritableSignal<AuthUser | null>;
  let isAuthenticated: WritableSignal<boolean>;
  let login: jest.Mock;
  let logout: jest.Mock;

  const setup = async (): Promise<HTMLElement> => {
    await TestBed.configureTestingModule({
      imports: [AuthMenuComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { status, user, isAuthenticated, login, logout },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AuthMenuComponent);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    status = signal<AuthStatus>('loading');
    user = signal<AuthUser | null>(null);
    isAuthenticated = signal(false);
    login = jest.fn();
    logout = jest.fn().mockResolvedValue(undefined);
  });

  it('não renderiza nada enquanto a sessão está carregando', async () => {
    const el = await setup();

    expect(el.querySelector('button')).toBeNull();
  });

  it('mostra "Entrar com Google" quando anônimo e dispara o login', async () => {
    status.set('anonymous');

    const el = await setup();
    const button = el.querySelector<HTMLButtonElement>('.auth-menu__login');

    expect(button?.textContent).toContain('Entrar com Google');

    button?.click();
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('mostra avatar, nome e Sair quando autenticado e dispara o logout', async () => {
    status.set('authenticated');
    isAuthenticated.set(true);
    user.set({
      id: 'u1',
      email: 'ana@example.com',
      name: 'Ana Dev',
      avatarUrl: 'https://cdn.example.test/ana.png',
    });

    const el = await setup();

    expect(el.querySelector('.auth-menu__name')?.textContent).toContain(
      'Ana Dev',
    );
    expect(el.querySelector<HTMLImageElement>('.auth-menu__avatar')?.src).toBe(
      'https://cdn.example.test/ana.png',
    );

    const prefsLink = el.querySelector<HTMLAnchorElement>('.auth-menu__prefs');
    expect(prefsLink?.textContent).toContain('Preferências');
    expect(prefsLink?.getAttribute('href')).toBe('/app/preferences');

    const logoutButton =
      el.querySelector<HTMLButtonElement>('.auth-menu__logout');
    logoutButton?.click();
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
