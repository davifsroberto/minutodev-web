import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let ensureLoaded: jest.Mock;
  let createUrlTree: jest.Mock;
  const urlTree = {} as UrlTree;

  const run = (): Promise<boolean | UrlTree> =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;

  beforeEach(() => {
    ensureLoaded = jest.fn();
    createUrlTree = jest.fn().mockReturnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { ensureLoaded } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  it('libera a rota quando a sessão está autenticada', async () => {
    ensureLoaded.mockResolvedValue(true);

    await expect(run()).resolves.toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redireciona para a home quando anônimo', async () => {
    ensureLoaded.mockResolvedValue(false);

    await expect(run()).resolves.toBe(urlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
