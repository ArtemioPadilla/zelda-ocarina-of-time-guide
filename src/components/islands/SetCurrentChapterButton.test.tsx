// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const memory = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    memory.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    memory.delete(key);
    return Promise.resolve();
  }),
}));

describe('SetCurrentChapterButton', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('shows the "mark as current" label when not the current chapter', async () => {
    const { default: SetCurrentChapterButton } = await import('./SetCurrentChapterButton');
    render(<SetCurrentChapterButton chapterId="c1" label="Mark as current" currentLabel="Current" />);
    expect(screen.getByRole('button', { name: 'Mark as current' })).toBeInTheDocument();
  });

  it('clicking sets the chapter as current, flipping label and aria-disabled', async () => {
    const user = userEvent.setup();
    const { default: SetCurrentChapterButton } = await import('./SetCurrentChapterButton');
    render(<SetCurrentChapterButton chapterId="c1" label="Mark as current" currentLabel="Current" />);

    const btn = screen.getByRole('button', { name: 'Mark as current' });
    await user.click(btn);

    expect(screen.getByRole('button', { name: 'Current' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('stays focusable (not the disabled attribute) once current, per aria-disabled contract', async () => {
    const user = userEvent.setup();
    const { default: SetCurrentChapterButton } = await import('./SetCurrentChapterButton');
    render(<SetCurrentChapterButton chapterId="c1" label="Mark as current" currentLabel="Current" />);

    await user.click(screen.getByRole('button', { name: 'Mark as current' }));
    const btn = screen.getByRole('button', { name: 'Current' });
    expect(btn).not.toBeDisabled();
    btn.focus();
    expect(btn).toHaveFocus();
  });
});
