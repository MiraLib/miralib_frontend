import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import BarraNavegacion from './BarraNavegacion';

describe('Componente BarraNavegacion', () => {
  it('muestra el nombre MiraLib y enlaza al inicio', () => {
    render(<MemoryRouter><BarraNavegacion /></MemoryRouter>);

    expect(screen.getByAltText('MiraLib Logo')).toBeInTheDocument();
    expect(screen.getByText('MiraLib').closest('a')).toHaveAttribute('href', '/');
  });

  it('tiene los enlaces a Inicio, Libros, Nosotros y Perfil', () => {
    render(<MemoryRouter><BarraNavegacion /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Libros' })).toHaveAttribute('href', '/libros');
    expect(screen.getByRole('link', { name: 'Nosotros' })).toHaveAttribute('href', '/nosotros');
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil');
  });
});
