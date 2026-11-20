import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Perfil from './Perfil';
import { obtenerPedidos, devolverPedido, extenderPedido } from '../services/api';
import { guardarSesion, obtenerSesion } from '../services/sesion';

vi.mock('../services/api', () => ({
  obtenerPedidos: vi.fn(),
  devolverPedido: vi.fn(),
  extenderPedido: vi.fn(),
}));

const libro = (id, titulo) => ({ id, titulo, imagen: `/${id}.jpg` });
const pedidos = [
  { id: 11, idLibro: 2, libro: libro(2, 'Clean Code'), fechaPedido: '20-11-2026', fechaDevolucion: '04-12-2026', estado: 'Vigente' },
  { id: 10, idLibro: 3, libro: libro(3, '1984'), fechaPedido: '01-11-2026', fechaDevolucion: '15-11-2026', estado: 'Devuelto' },
];

const renderPerfil = () =>
  render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Routes>
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('Página Perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => vi.restoreAllMocks());

  it('sin sesión pide iniciar sesión y no consulta pedidos', () => {
    renderPerfil();
    expect(screen.getByText('No has iniciado sesión')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a Iniciar Sesión' })).toHaveAttribute('href', '/login');
    expect(obtenerPedidos).not.toHaveBeenCalled();
  });

  describe('con sesión', () => {
    beforeEach(() => {
      guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
      obtenerPedidos.mockResolvedValue(pedidos);
    });

    it('muestra los datos del usuario y separa pedidos activos del historial', async () => {
      renderPerfil();

      expect(screen.getByText('Exequiel')).toBeInTheDocument();
      expect(await screen.findByText('Clean Code')).toBeInTheDocument();
      expect(obtenerPedidos).toHaveBeenCalledWith(1);
      expect(screen.getByText('Historial de devoluciones')).toBeInTheDocument();
      expect(screen.getByText('Devuelto')).toBeInTheDocument();
      // Solo el pedido activo tiene acciones
      expect(screen.getAllByRole('button', { name: 'Devolver' })).toHaveLength(1);
    });

    it('sin pedidos lo indica', async () => {
      obtenerPedidos.mockResolvedValue([]);
      renderPerfil();
      expect(await screen.findByText('No tienes libros pedidos en este momento.')).toBeInTheDocument();
      expect(screen.queryByText('Historial de devoluciones')).not.toBeInTheDocument();
    });

    it('si el backend falla muestra un error', async () => {
      obtenerPedidos.mockRejectedValue(new Error('Failed to fetch'));
      renderPerfil();
      expect(await screen.findByText('No se pudieron cargar tus pedidos desde el servidor de MiraLib.')).toBeInTheDocument();
    });

    it('devolver pide confirmación, llama al backend y recarga los pedidos', async () => {
      devolverPedido.mockResolvedValue({});
      renderPerfil();

      fireEvent.click(await screen.findByRole('button', { name: 'Devolver' }));

      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('¡Libro devuelto con éxito! El stock en el catálogo ha aumentado.'));
      expect(window.confirm).toHaveBeenCalled();
      expect(devolverPedido).toHaveBeenCalledWith(11);
      expect(obtenerPedidos).toHaveBeenCalledTimes(2);
    });

    it('si el usuario cancela la confirmación no devuelve', async () => {
      window.confirm.mockReturnValue(false);
      renderPerfil();

      fireEvent.click(await screen.findByRole('button', { name: 'Devolver' }));

      expect(devolverPedido).not.toHaveBeenCalled();
    });

    it('si la devolución falla muestra el mensaje del backend', async () => {
      devolverPedido.mockRejectedValue(new Error('Este pedido ya fue devuelto'));
      renderPerfil();

      fireEvent.click(await screen.findByRole('button', { name: 'Devolver' }));

      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Este pedido ya fue devuelto'));
      expect(obtenerPedidos).toHaveBeenCalledTimes(1);
    });

    it('extender plazo llama al backend y recarga los pedidos', async () => {
      extenderPedido.mockResolvedValue({});
      renderPerfil();

      fireEvent.click(await screen.findByRole('button', { name: 'Extender plazo' }));

      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Se ha extendido tu plazo de devolución por 7 días más.'));
      expect(extenderPedido).toHaveBeenCalledWith(11);
      expect(obtenerPedidos).toHaveBeenCalledTimes(2);
    });

    it('si extender falla muestra el mensaje', async () => {
      extenderPedido.mockRejectedValue(new Error(''));
      renderPerfil();

      fireEvent.click(await screen.findByRole('button', { name: 'Extender plazo' }));

      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo extender el plazo.'));
    });

    it('cerrar sesión borra la sesión y va al login', async () => {
      renderPerfil();
      await screen.findByText('Clean Code');

      fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));

      expect(await screen.findByText('Página de login')).toBeInTheDocument();
      expect(obtenerSesion()).toBeNull();
    });
  });
});
