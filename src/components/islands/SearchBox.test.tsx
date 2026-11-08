// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox, { search, normalize } from './SearchBox';

const index = [
  {
    t: 'El rescate',
    s: 'misión · P2',
    k: 'chapter',
    h: '/chapters/the-rescue/',
    x: 'The Rescue',
  },
  { t: 'Sandra Dorsett', s: 'personaje', k: 'character', h: '/characters/sandra-dorsett/' },
  { t: 'Sandevistan', s: 'equipo', k: 'gear', h: '/arsenal/gear/sandevistan/' },
  { t: 'Fragmento de prueba', s: 'fragmento', k: 'file', h: '/files/#test-shard', x: 'Test shard' },
] as const;

const labels = {
  open: 'Buscar',
  placeholder: 'Busca…',
  empty: 'Nada',
  hint: 'para navegar',
  close: 'Cerrar',
};

describe('search()', () => {
  it('strips accents and ranks title matches above hidden text', () => {
    expect(normalize('Misión')).toBe('mision');
    const r = search([...index], 'sand');
    expect(r.map((x) => x.t)).toEqual(['Sandevistan', 'Sandra Dorsett']);
    expect(search([...index], 'mision')[0].t).toBe('El rescate');
    expect(search([...index], 'the rescue')[0].t).toBe('El rescate');
    expect(search([...index], 'shard')[0].t).toBe('Fragmento de prueba');
    expect(search([...index], 'zzz')).toEqual([]);
  });
});

describe('SearchBox', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve(index) })),
    );
  });

  it('opens with the button, filters the fetched index and marks the active option', async () => {
    const user = userEvent.setup();
    render(<SearchBox indexHref="/search-index.json" labels={labels} />);
    await user.click(screen.getByRole('button', { name: /Buscar/ }));
    const input = await screen.findByRole('combobox');
    await user.type(input, 'sand');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: /Sandevistan/ })).toHaveAttribute(
      'href',
      '/arsenal/gear/sandevistan/',
    );
  });

  it('opens with Ctrl+K and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<SearchBox indexHref="/search-index.json" labels={labels} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
