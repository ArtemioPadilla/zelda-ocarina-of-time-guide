// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('catches a render error and shows the default fallback', () => {
    // React logs the caught error to console.error — expected noise for this test.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Error: boom/)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('uses the localized labels when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary messageLabel="Algo falló." reportLabel="Reportar">
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo falló.')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('invokes a custom fallback render-prop instead of the default UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={(error) => <p>custom: {error.message}</p>}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: boom')).toBeInTheDocument();
    spy.mockRestore();
  });
});
