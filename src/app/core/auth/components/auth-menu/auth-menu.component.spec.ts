import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { AuthStatus, AuthUser } from '../../auth.model';
import { AuthService } from '../../auth.service';
import { AuthMenuComponent } from './auth-menu.component';

expect.extend(toHaveNoViolations);

const hoverEvent = (type: string, pointerType: string): Event =>
  Object.assign(new Event(type, { bubbles: true }), { pointerType });

describe('AuthMenuComponent', () => {
  let status: WritableSignal<AuthStatus>;
  let user: WritableSignal<AuthUser | null>;
  let isAuthenticated: WritableSignal<boolean>;
  let login: jest.Mock;
  let logout: jest.Mock;
  let fixture: ComponentFixture<AuthMenuComponent>;

  const setup = async (): Promise<HTMLElement> => {
    await TestBed.configureTestingModule({
      imports: [AuthMenuComponent],
      providers: [
        // Rotas-alvo dos itens do menu, para o clique de navegação real do
        // teste "fecha ao navegar" não estourar NG04002.
        provideRouter([
          { path: 'app/history', children: [] },
          { path: 'app/preferences', children: [] },
        ]),
        {
          provide: AuthService,
          useValue: { status, user, isAuthenticated, login, logout },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthMenuComponent);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  };

  const signInAs = (name: string, avatarUrl: string | null): void => {
    status.set('authenticated');
    isAuthenticated.set(true);
    user.set({
      id: 'u1',
      email: 'ana@example.test',
      name,
      avatarUrl,
    });
  };

  const openMenu = (el: HTMLElement): void => {
    el.querySelector<HTMLButtonElement>('.user-menu__trigger')?.click();
    fixture.detectChanges();
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

  it('autenticado, mostra só o avatar na barra — nome e ações ficam no menu', async () => {
    signInAs('Ana Dev', 'https://cdn.example.test/ana.png');

    const el = await setup();
    const trigger = el.querySelector<HTMLButtonElement>('.user-menu__trigger');

    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector<HTMLImageElement>('.user-menu__avatar')?.src).toBe(
      'https://cdn.example.test/ana.png',
    );

    // Barra limpa: nada de nome nem painel antes de abrir.
    expect(el.textContent).not.toContain('Ana Dev');
    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('clique no avatar abre o menu com identidade, links e Sair', async () => {
    signInAs('Ana Dev', 'https://cdn.example.test/ana.png');

    const el = await setup();
    openMenu(el);

    const trigger = el.querySelector<HTMLButtonElement>('.user-menu__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-controls')).toBe('auth-user-menu');

    const panel = el.querySelector<HTMLElement>('.user-menu__panel');
    expect(panel).not.toBeNull();
    expect(panel?.querySelector('.user-menu__name')?.textContent).toContain(
      'Ana Dev',
    );
    expect(panel?.querySelector('.user-menu__email')?.textContent).toContain(
      'ana@example.test',
    );

    const links =
      panel?.querySelectorAll<HTMLAnchorElement>('a.user-menu__item');
    expect(links?.[0]?.textContent).toContain('Histórico');
    expect(links?.[0]?.getAttribute('href')).toBe('/app/history');
    expect(links?.[1]?.textContent).toContain('Preferências');
    expect(links?.[1]?.getAttribute('href')).toBe('/app/preferences');

    expect(
      panel?.querySelector('.user-menu__item--signout')?.textContent,
    ).toContain('Sair');
  });

  it('Sair dispara o logout e fecha o menu', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    openMenu(el);

    el.querySelector<HTMLButtonElement>('.user-menu__item--signout')?.click();
    fixture.detectChanges();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('abre no hover do mouse e fecha quando o ponteiro sai', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    const wrapper = el.querySelector<HTMLElement>('.user-menu');

    wrapper?.dispatchEvent(hoverEvent('pointerenter', 'mouse'));
    fixture.detectChanges();
    expect(el.querySelector('.user-menu__panel')).not.toBeNull();

    wrapper?.dispatchEvent(hoverEvent('pointerleave', 'mouse'));
    fixture.detectChanges();
    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('clicar no avatar logo após abrir por hover mantém o menu; segundo clique fecha', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    const wrapper = el.querySelector<HTMLElement>('.user-menu');
    const trigger = el.querySelector<HTMLButtonElement>('.user-menu__trigger');

    wrapper?.dispatchEvent(hoverEvent('pointerenter', 'mouse'));
    fixture.detectChanges();
    expect(el.querySelector('.user-menu__panel')).not.toBeNull();

    // O clique que "confirma" o hover não pode fechar o menu…
    trigger?.click();
    fixture.detectChanges();
    expect(el.querySelector('.user-menu__panel')).not.toBeNull();

    // …mas um clique deliberado em seguida fecha.
    trigger?.click();
    fixture.detectChanges();
    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('ignora o pointerenter de toque (o tap abre pelo clique, sem toggle duplo)', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    const wrapper = el.querySelector<HTMLElement>('.user-menu');

    wrapper?.dispatchEvent(hoverEvent('pointerenter', 'touch'));
    fixture.detectChanges();

    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('fecha com Escape devolvendo o foco ao avatar e com clique fora', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    document.body.appendChild(el);

    openMenu(el);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(el.querySelector('.user-menu__panel')).toBeNull();
    expect(document.activeElement).toBe(
      el.querySelector('.user-menu__trigger'),
    );

    openMenu(el);
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(el.querySelector('.user-menu__panel')).toBeNull();
    el.remove();
  });

  it('fecha ao navegar por um item do menu', async () => {
    signInAs('Ana Dev', null);

    const el = await setup();
    openMenu(el);

    el.querySelector<HTMLAnchorElement>('a.user-menu__item')?.click();
    fixture.detectChanges();

    expect(el.querySelector('.user-menu__panel')).toBeNull();
  });

  it('sem avatar (ou com imagem quebrada) mostra as iniciais do usuário', async () => {
    signInAs('Ana Clara Dev', null);

    const el = await setup();

    expect(el.querySelector('.user-menu__initials')?.textContent?.trim()).toBe(
      'AD',
    );
  });

  it('cai para as iniciais quando a imagem do avatar falha', async () => {
    signInAs('Ana Dev', 'https://cdn.example.test/broken.png');

    const el = await setup();
    el.querySelector<HTMLImageElement>('.user-menu__avatar')?.dispatchEvent(
      new Event('error'),
    );
    fixture.detectChanges();

    expect(el.querySelector('.user-menu__avatar')).toBeNull();
    expect(el.querySelector('.user-menu__initials')?.textContent?.trim()).toBe(
      'AD',
    );
  });

  it('passa no AXE com o menu aberto', async () => {
    signInAs('Ana Dev', 'https://cdn.example.test/ana.png');

    const el = await setup();
    openMenu(el);

    document.body.appendChild(el);
    const results = await axe(el, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      rules: { 'color-contrast': { enabled: false } },
    });
    el.remove();
    expect(results).toHaveNoViolations();
  });
});
