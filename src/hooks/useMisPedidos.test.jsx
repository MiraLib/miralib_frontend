import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMisPedidos, estadoLibro } from './useMisPedidos';
import { obtenerPedidos, crearPedido } from '../services/api';
import { guardarSesion } from '../services/sesion';

vi.mock('../services/api', () => ({
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const libro = { id: 2, titulo: 'Clean Code', stock: 4, proximamente: false };
const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('estadoLibro', () => {
  it('un libro con stock y no solicitado se puede pedir', () => {
    expect(estadoLibro(libro, 4, false)).toEqual({ texto: 'Pedir', puedePedir: true, tipo: 'disponible' });
  });

  it('si el usuario ya lo tiene muestra "Solicitado"', () => {
    expect(estadoLibro(libro, 4, true)).toMatchObject({ texto: 'Solicitado', puedePedir: false });
  });

  it('sin stock muestra "Agotado"', () => {
    expect(estadoLibro(libro, 0, false)).toMatchObject({ texto: 'Agotado', puedePedir: false });
  });

  it('"Solicitado" tiene prioridad sobre "Agotado"', () => {
    expect(estadoLibro(libro, 0, true).texto).toBe('Solicitado');
  });

  it('"Próximamente" tiene prioridad sobre todo', () => {
    expect(estadoLibro({ ...libro, proximamente: true }, 0, true)).toMatchObject({
      texto: 'Próximamente',
      puedePedir: false,
    });
  });
});

describe('useMisPedidos', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('sin sesión no consulta pedidos', () => {
    const { result } = renderHook(() => useMisPedidos(), { wrapper });
    expect(obtenerPedidos).not.toHaveBeenCalled();
    expect(result.current.solicitados.size).toBe(0);
  });

  it('carga como solicitados los libros vigentes o vencidos, no los devueltos', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([
      { id: 1, idLibro: 2, estado: 'Vigente' },
      { id: 2, idLibro: 3, estado: 'Vencido' },
      { id: 3, idLibro: 4, estado: 'Devuelto' },
    ]);

    const { result } = renderHook(() => useMisPedidos(), { wrapper });

    await waitFor(() => expect(result.current.solicitados.size).toBe(2));
    expect(obtenerPedidos).toHaveBeenCalledWith(1);
    expect([...result.current.solicitados]).toEqual([2, 3]);
  });

  it('si falla la carga de pedidos no rompe (queda sin solicitados)', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockRejectedValue(new Error('sin conexión'));

    const { result } = renderHook(() => useMisPedidos(), { wrapper });

    await waitFor(() => expect(obtenerPedidos).toHaveBeenCalled());
    expect(result.current.solicitados.size).toBe(0);
  });

  it('pedir sin sesión avisa y redirige a /login', async () => {
    const { result } = renderHook(() => useMisPedidos(), { wrapper });

    let respuesta;
    await act(async () => { respuesta = await result.current.pedirLibro(libro); });

    expect(respuesta).toBeNull();
    expect(window.alert).toHaveBeenCalledWith('Debes iniciar sesión para pedir un libro.');
    expect(navigateMock).toHaveBeenCalledWith('/login');
    expect(crearPedido).not.toHaveBeenCalled();
  });

  it('pedir con sesión crea el pedido, marca el libro como solicitado y devuelve el libro actualizado', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([]);
    crearPedido.mockResolvedValue({ id: 10, libro: { ...libro, stock: 3 } });

    const { result } = renderHook(() => useMisPedidos(), { wrapper });

    let respuesta;
    await act(async () => { respuesta = await result.current.pedirLibro(libro); });

    expect(crearPedido).toHaveBeenCalledWith(1, 2);
    expect(respuesta.stock).toBe(3);
    expect(result.current.solicitados.has(2)).toBe(true);
    expect(window.alert).toHaveBeenCalledWith('¡Éxito! Has pedido: Clean Code');
  });

  it('si el backend rechaza el pedido muestra su mensaje y no marca el libro', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([]);
    crearPedido.mockRejectedValue(new Error('No se puede dar el libro: stock agotado'));

    const { result } = renderHook(() => useMisPedidos(), { wrapper });

    let respuesta;
    await act(async () => { respuesta = await result.current.pedirLibro(libro); });

    expect(respuesta).toBeNull();
    expect(window.alert).toHaveBeenCalledWith('No se puede dar el libro: stock agotado');
    expect(result.current.solicitados.has(2)).toBe(false);
  });

  it('si el error no trae mensaje usa uno genérico', async () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    obtenerPedidos.mockResolvedValue([]);
    crearPedido.mockRejectedValue(new Error(''));

    const { result } = renderHook(() => useMisPedidos(), { wrapper });
    await act(async () => { await result.current.pedirLibro(libro); });

    expect(window.alert).toHaveBeenCalledWith('No se pudo pedir el libro.');
  });
});
