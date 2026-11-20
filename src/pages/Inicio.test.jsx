import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Inicio from './Inicio';
import { obtenerLibros, obtenerPedidos } from '../services/api';

vi.mock('../services/api', () => ({
  obtenerLibros: vi.fn(),
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
}));

const libro = (id, titulo, proximamente = false) => ({
  id, titulo, autor: 'Autor', categoria: 'Cat', stock: 5, imagen: `/${id}.jpg`, proximamente,
});

describe('Página Inicio', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    obtenerPedidos.mockResolvedValue([]);
  });

  it('muestra los 3 libros disponibles más recientes y los de Próximamente con sus portadas', async () => {
    obtenerLibros.mockResolvedValue([
      libro(1, 'Libro 1'), libro(2, 'Libro 2'), libro(3, 'Libro 3'), libro(4, 'Libro 4'),
      libro(5, 'Coraline', true), libro(6, 'Alicia', true),
    ]);
    render(<MemoryRouter><Inicio /></MemoryRouter>);

    const recientes = (await screen.findByText('Recién Agregados')).parentElement;
    expect(await within(recientes).findByText('Libro 4')).toBeInTheDocument();
    expect(within(recientes).getAllByRole('heading', { level: 3 }).map(h => h.textContent))
      .toEqual(['Recién Agregados', 'Libro 4', 'Libro 3', 'Libro 2']);

    const proximamente = screen.getByText('Próximamente en MiraLib').parentElement;
    expect(within(proximamente).getByAltText('Coraline')).toHaveAttribute('src', '/5.jpg');
    expect(within(proximamente).getByAltText('Alicia')).toBeInTheDocument();
    expect(within(proximamente).getAllByText('Pronto')).toHaveLength(2);
  });

  it('tiene el acceso al catálogo completo', () => {
    obtenerLibros.mockResolvedValue([]);
    render(<MemoryRouter><Inicio /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ir al Catálogo Completo' })).toHaveAttribute('href', '/libros');
  });

  it('si el backend falla las secciones quedan vacías sin romper la página', async () => {
    obtenerLibros.mockRejectedValue(new Error('Failed to fetch'));
    render(<MemoryRouter><Inicio /></MemoryRouter>);

    expect(await screen.findByText('Recién Agregados')).toBeInTheDocument();
    expect(screen.queryByText('Pronto')).not.toBeInTheDocument();
  });
});
