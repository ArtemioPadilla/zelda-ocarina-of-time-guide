// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes progressbar semantics with the given bounds', () => {
    render(<ProgressBar done={3} total={10} label="Skulltulas" />);
    const bar = screen.getByRole('progressbar', { name: 'Skulltulas' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
  });

  it('shows the done/total count as text', () => {
    render(<ProgressBar done={3} total={10} label="Skulltulas" />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders 0% width without dividing by zero when total is 0', () => {
    const { container } = render(<ProgressBar done={0} total={0} label="Empty" />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '0%' });
  });
});
