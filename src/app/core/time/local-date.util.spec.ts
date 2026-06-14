import { LocalDateUtil } from './local-date.util';

describe('toLocalDateParam', () => {
  it('formats local year/month/day as YYYY-MM-DD', () => {
    expect(LocalDateUtil.toLocalDateParam(new Date(2026, 5, 13, 10, 30))).toBe(
      '2026-06-13',
    );
  });

  it('zero-pads single-digit months and days', () => {
    expect(LocalDateUtil.toLocalDateParam(new Date(2026, 0, 5))).toBe(
      '2026-01-05',
    );
    expect(LocalDateUtil.toLocalDateParam(new Date(2026, 8, 9))).toBe(
      '2026-09-09',
    );
  });

  it('keeps the local calendar day late at night (not the UTC day)', () => {
    expect(
      LocalDateUtil.toLocalDateParam(new Date(2026, 5, 13, 23, 59, 59)),
    ).toBe('2026-06-13');
  });
});
