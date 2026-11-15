// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}));

const mockedUseRegisterSW = vi.mocked(useRegisterSW);
const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
const setNeedRefresh = vi.fn();
const setOfflineReady = vi.fn();

describe('PwaUpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('offers to reload when an update is waiting and activates it on request', async () => {
    mockedUseRegisterSW.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      offlineReady: [false, setOfflineReady],
      updateServiceWorker,
    });

    render(<PwaUpdatePrompt />);

    fireEvent.click(screen.getByRole('button', { name: 'Reload to update' }));

    await waitFor(() => {
      expect(updateServiceWorker).toHaveBeenCalledWith(true);
    });
  });

  it('does not render a message when there is no update or offline status', () => {
    mockedUseRegisterSW.mockReturnValue({
      needRefresh: [false, setNeedRefresh],
      offlineReady: [false, setOfflineReady],
      updateServiceWorker,
    });

    render(<PwaUpdatePrompt />);

    expect(screen.queryByRole('status')).toBeNull();
  });
});
