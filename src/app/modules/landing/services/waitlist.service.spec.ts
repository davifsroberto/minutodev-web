import { TestBed } from '@angular/core/testing';

import { WaitlistService } from './waitlist.service';

describe('WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaitlistService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('completes the subscription after the simulated latency', () => {
    // Arrange
    jest.useFakeTimers();
    let completed = false;

    // Act
    service
      .join({ email: 'dev@example.com' })
      .subscribe({ complete: () => (completed = true) });
    jest.advanceTimersByTime(600);

    // Assert
    expect(completed).toBe(true);
  });

  it('emits a void value without leaking the submitted payload', () => {
    // Arrange
    jest.useFakeTimers();
    let received: unknown = 'untouched';

    // Act
    service.join({ email: 'dev@example.com' }).subscribe((value) => {
      received = value;
    });
    jest.advanceTimersByTime(600);

    // Assert
    expect(received).toBeUndefined();
  });

  it('does not emit before the latency elapses', () => {
    // Arrange
    jest.useFakeTimers();
    let emitted = false;

    // Act
    service
      .join({ email: 'dev@example.com' })
      .subscribe(() => (emitted = true));
    jest.advanceTimersByTime(599);

    // Assert
    expect(emitted).toBe(false);
  });
});
