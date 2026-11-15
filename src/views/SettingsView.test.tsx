// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../db/sampleData';
import { SettingsView } from './SettingsView';

const { mockUseApp } = vi.hoisted(() => ({
  mockUseApp: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useApp: mockUseApp,
}));

describe('SettingsView demo data controls', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({
      settings: DEFAULT_SETTINGS,
      updateSettings: vi.fn(),
      toggleModuleEnabled: vi.fn(),
      setThemeMode: vi.fn(),
      setAccentColor: vi.fn(),
      tasks: [],
      events: [],
      birthdays: [],
      resetAllData: vi.fn(),
      exportBackup: vi.fn(),
      importBackup: vi.fn(),
      requestNotificationPermission: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('does not expose manual sample load or purge controls', () => {
    render(<SettingsView />);

    expect(screen.queryByText('Sample Demo Data Controls')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Load Sample Demo Records' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Purge Only Demo Records' })).toBeNull();
  });
});
