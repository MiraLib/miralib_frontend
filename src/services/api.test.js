import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  aLibroFront,
  obtenerLibros,
  obtenerLibro,
  obtenerUsuarios,
  registrarUsuario,
  obtenerPedidos,
  crearPedido,
  devolverPedido,
  extenderPedido,
} from './api';

const libroBackend = {
  id: 2,
  nombreCompartidor: 'MiraLib',
  nombreLibro: 'Clean Code',
  autorLibro: 'Robert C. Martin',
  categoriaLibro: 'Programación',
  sipnosisLibro: 'Código limpio',
  stock: 4,
  fechaDeEntrega: '2026-12-31',
  imagen: 'https://portadas.test/clean-code.jpg',
  proximamente: false,
};

const pedidoBackend = {
  id: 10,
  usuario: { id: 1, nombre: 'Exequiel', correo: 'exe@miralib.test' },
  libro: libroBackend,
  fechaPedido: '2026-11-20',
  fechaDevolucion: '2026-12-04',
  estado: 'Vigente',
};

// Respuesta falsa de fetch: el cliente siempre lee el cuerpo como texto
const respuesta = (cuerpo, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)),
});

describe('services/api', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  describe('aLibroFront', () => {
    it('traduce los campos del backend a los del frontend', () => {
      expect(aLibroFront(libroBackend)).toEqual({
        id: 2,
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        categoria: 'Programación',
        sinopsis: 'Código limpio',
        stock: 4,
        compartidor: 'MiraLib',
        fechaDeEntrega: '2026-12-31',
        imagen: 'https://portadas.test/clean-code.jpg',
        proximamente: false,
      });
    });

    it('usa la portada genérica si el libro no tiene imagen', () => {
      expect(aLibroFront({ ...libroBackend, imagen: null }).imagen).toBe('/portada.svg');
    });

    it('trata proximamente null como false', () => {
      expect(aLibroFront({ ...libroBackend, proximamente: null }).proximamente).toBe(false);
      expect(aLibroFront({ ...libroBackend, proximamente: true }).proximamente).toBe(true);
    });
  });

  describe('libros', () => {
    it('obtenerLibros llama a /api/v1/books y mapea la lista', async () => {
      fetchMock.mockResolvedValue(respuesta([libroBackend]));

      const libros = await obtenerLibros();

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/books', expect.any(Object));
      expect(libros[0].titulo).toBe('Clean Code');
    });

    it('obtenerLibro consulta por id', async () => {
      fetchMock.mockResolvedValue(respuesta(libroBackend));

      const libro = await obtenerLibro(2);

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/books/id?id=2', expect.any(Object));
      expect(libro.autor).toBe('Robert C. Martin');
    });

    it('obtenerLibro devuelve null si el backend responde vacío', async () => {
      fetchMock.mockResolvedValue(respuesta(''));
      expect(await obtenerLibro(99)).toBeNull();
    });
  });

  describe('usuarios', () => {
    it('obtenerUsuarios devuelve la lista del backend', async () => {
      fetchMock.mockResolvedValue(respuesta([{ id: 1, nombre: 'Exequiel' }]));
      expect(await obtenerUsuarios()).toEqual([{ id: 1, nombre: 'Exequiel' }]);
    });

    it('registrarUsuario envía id 0 y los nombres de campo del backend', async () => {
      fetchMock.mockResolvedValue(respuesta({ id: 5 }));

      await registrarUsuario({ nombre: 'Ana', email: 'ana@miralib.test', password: 'clave123' });

      const [url, opciones] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/v1/users/add');
      expect(opciones.method).toBe('POST');
      expect(JSON.parse(opciones.body)).toEqual({
        id: 0,
        nombre: 'Ana',
        correo: 'ana@miralib.test',
        contrasena: 'clave123',
      });
    });
  });

  describe('pedidos', () => {
    it('obtenerPedidos mapea el pedido y convierte las fechas a dd-mm-aaaa', async () => {
      fetchMock.mockResolvedValue(respuesta([pedidoBackend]));

      const [pedido] = await obtenerPedidos(1);

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/pedidos/usuario/1', expect.any(Object));
      expect(pedido).toMatchObject({
        id: 10,
        idLibro: 2,
        fechaPedido: '20-11-2026',
        fechaDevolucion: '04-12-2026',
        estado: 'Vigente',
      });
      expect(pedido.libro.titulo).toBe('Clean Code');
    });

    it('crearPedido envía usuarioId y libroId por POST', async () => {
      fetchMock.mockResolvedValue(respuesta(pedidoBackend));

      const pedido = await crearPedido(1, 2);

      const [url, opciones] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/v1/pedidos/add');
      expect(opciones.method).toBe('POST');
      expect(JSON.parse(opciones.body)).toEqual({ usuarioId: 1, libroId: 2 });
      expect(pedido.libro.stock).toBe(4);
    });

    it('devolverPedido y extenderPedido usan PUT con el id del pedido', async () => {
      fetchMock.mockResolvedValue(respuesta({ ...pedidoBackend, estado: 'Devuelto' }));
      expect((await devolverPedido(10)).estado).toBe('Devuelto');
      expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/pedidos/devolver/10', expect.objectContaining({ method: 'PUT' }));

      fetchMock.mockResolvedValue(respuesta({ ...pedidoBackend, fechaDevolucion: '2026-12-11' }));
      expect((await extenderPedido(10)).fechaDevolucion).toBe('11-12-2026');
      expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/pedidos/extender/10', expect.objectContaining({ method: 'PUT' }));
    });
  });

  describe('errores', () => {
    it('lanza un Error con el mensaje que devuelve el backend', async () => {
      fetchMock.mockResolvedValue(respuesta('Ya tienes este libro en tus pedidos actuales', false, 400));
      await expect(crearPedido(1, 2)).rejects.toThrow('Ya tienes este libro en tus pedidos actuales');
    });

    it('si el backend no envía mensaje, el error indica el código HTTP', async () => {
      fetchMock.mockResolvedValue(respuesta('', false, 500));
      await expect(obtenerLibros()).rejects.toThrow('Error 500 al llamar a /books');
    });

    it('propaga la falla de red', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(obtenerLibros()).rejects.toThrow('Failed to fetch');
    });
  });
});
