import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Libros from './Libros';
import { obtenerLibros, obtenerPedidos } from '../services/api';
import { guardarSesion } from '../services/sesion';

vi.mock('../services/api', () => ({
  obtenerLibros: vi.fn(),
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
}));

const libros = [
  { id: 1, titulo: 'El Señor de los Anillos', autor: 'J.R.R. Tolkien', categoria: 'Fantasía', stock: 10, imagen: '/a.jpg', proximamente: false },
  { id: 2, titulo: 'Clean Code', autor: 'Robert C. Martin', categoria: 'Programación', stock: 4, imagen: '/b.jpg', proximamente: false },
  { id: 3, titulo: '1984', autor: 'George Orwell', categoria: 'Ficción Distópica', stock: 0, imagen: '/c.jpg', proximamente: false },
  { id: 5, titulo: 'Coraline', autor: 'Neil Gaiman', categoria: 'Literatura infantil', stock: 0, imagen: '/d.jpg', proximamente: true },
];

const renderLibros = () => render(<MemoryRouter><Libros /></MemoryRouter>);
const titulos = () => screen.queryAllByRole('heading', { level: 3 }).map(h => h.textContent);

describe('Página Libros (catálogo)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    obtenerLibros.mockResolvedValue(libros);
    obtenerPedidos.mockResolvedValue([]);
  });

  it('muestra "Cargando" y luego los libros del backend, sin los de Próximamente', async () => {
    renderLibros();
    expect(screen.getByText('Cargando libros...')).toBeInTheDocument();

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(titulos()).toEqual(['El Señor de los Anillos', 'Clean Code', '1984']);
    expect(screen.queryByText('Coraline')).not.toBeInTheDocument();
  });

  it('genera los filtros con las categorías de los libros disponibles', async () => {
    renderLibros();
    await screen.findByText('Clean Code');

    expect(screen.getByLabelText('Fantasía')).toBeInTheDocument();
    expect(screen.getByLabelText('Programación')).toBeInTheDocument();
    expect(screen.queryByLabelText('Literatura infantil')).not.toBeInTheDocument();
  });

  it('busca por título o autor sin importar mayúsculas', async () => {
    renderLibros();
    await screen.findByText('Clean Code');
    const buscador = screen.getByPlaceholderText('Buscar por título, autor o palabra clave...');

    fireEvent.change(buscador, { target: { value: 'ORWELL' } });
    expect(titulos()).toEqual(['1984']);

    fireEvent.change(buscador, { target: { value: 'clean' } });
    expect(titulos()).toEqual(['Clean Code']);
  });

  it('filtra por categoría', async () => {
    renderLibros();
    await screen.findByText('Clean Code');

    fireEvent.click(screen.getByLabelText('Fantasía'));

    expect(titulos()).toEqual(['El Señor de los Anillos']);
  });

  it('sin resultados ofrece limpiar los filtros', async () => {
    renderLibros();
    await screen.findByText('Clean Code');

    fireEvent.change(screen.getByPlaceholderText('Buscar por título, autor o palabra clave...'), { target: { value: 'xyz' } });
    expect(screen.getByText('No se encontraron libros que coincidan con tu búsqueda.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(titulos()).toHaveLength(3);
  });

  it('cada tarjeta muestra el botón según el estado del libro para el usuario', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([{ id: 9, idLibro: 2, estado: 'Vigente' }]);
    renderLibros();

    const tarjeta = (titulo) => screen.getByText(titulo).closest('div').parentElement;
    await screen.findByText('Clean Code');
    expect(await within(tarjeta('Clean Code')).findByRole('button', { name: 'Solicitado' })).toBeDisabled();
    expect(within(tarjeta('El Señor de los Anillos')).getByRole('button', { name: 'Pedir' })).toBeEnabled();
    expect(within(tarjeta('1984')).getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });

  it('si el backend no responde muestra un error', async () => {
    obtenerLibros.mockRejectedValue(new Error('Failed to fetch'));
    renderLibros();

    expect(await screen.findByText('No se pudo conectar con el servidor de MiraLib.')).toBeInTheDocument();
  });
});
