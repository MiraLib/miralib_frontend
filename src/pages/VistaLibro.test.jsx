import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VistaLibro from './VistaLibro';
import { obtenerLibro, obtenerPedidos, crearPedido } from '../services/api';
import { guardarSesion } from '../services/sesion';

vi.mock('../services/api', () => ({
  obtenerLibro: vi.fn(),
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
}));

const libro = {
  id: 2,
  titulo: 'Clean Code',
  autor: 'Robert C. Martin',
  categoria: 'Programación',
  sinopsis: 'Una guía de código limpio.',
  stock: 4,
  imagen: '/clean-code.jpg',
  proximamente: false,
};

const renderVista = (id = 2) =>
  render(
    <MemoryRouter initialEntries={[`/libro/${id}`]}>
      <Routes>
        <Route path="/libro/:id" element={<VistaLibro />} />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('Página VistaLibro (detalle)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    obtenerPedidos.mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('pide el libro de la URL al backend y muestra su ficha', async () => {
    obtenerLibro.mockResolvedValue(libro);
    renderVista(2);

    expect(screen.getByText('Cargando libro...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Clean Code' })).toBeInTheDocument();
    expect(obtenerLibro).toHaveBeenCalledWith('2');
    expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    expect(screen.getByText('Una guía de código limpio.')).toBeInTheDocument();
    expect(screen.getByText('Disponibles: 4')).toBeInTheDocument();
  });

  it('si el libro no existe lo indica', async () => {
    obtenerLibro.mockResolvedValue(null);
    renderVista(99);
    expect(await screen.findByText('Libro no encontrado')).toBeInTheDocument();
  });

  it('si el backend falla lo trata como no encontrado', async () => {
    obtenerLibro.mockRejectedValue(new Error('Failed to fetch'));
    renderVista(2);
    expect(await screen.findByText('Libro no encontrado')).toBeInTheDocument();
  });

  it('pedir crea el pedido, cambia a "Solicitado" y actualiza los disponibles', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerLibro.mockResolvedValue(libro);
    crearPedido.mockResolvedValue({ id: 10, libro: { ...libro, stock: 3 } });
    renderVista(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Pedir este libro ahora' }));

    expect(await screen.findByRole('button', { name: 'Solicitado' })).toBeDisabled();
    expect(crearPedido).toHaveBeenCalledWith(1, 2);
    expect(screen.getByText('Disponibles: 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'tu Perfil' })).toHaveAttribute('href', '/perfil');
  });

  it('pedir sin sesión lleva al login', async () => {
    obtenerLibro.mockResolvedValue(libro);
    renderVista(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Pedir este libro ahora' }));

    expect(await screen.findByText('Página de login')).toBeInTheDocument();
  });

  it('si el usuario ya lo tiene muestra "Solicitado" desde el inicio', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([{ id: 10, idLibro: 2, estado: 'Vigente' }]);
    obtenerLibro.mockResolvedValue(libro);
    renderVista(2);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Solicitado' })).toBeDisabled());
    expect(screen.getByText(/Ya tienes este libro/)).toBeInTheDocument();
  });

  it('un libro agotado no se puede pedir', async () => {
    obtenerLibro.mockResolvedValue({ ...libro, stock: 0 });
    renderVista(2);

    expect(await screen.findByText('Agotado por ahora.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });

  it('un libro de próximamente no se puede pedir', async () => {
    obtenerLibro.mockResolvedValue({ ...libro, stock: 0, proximamente: true });
    renderVista(5);

    expect(await screen.findByText('Este libro estará disponible próximamente.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximamente' })).toBeDisabled();
  });
});
