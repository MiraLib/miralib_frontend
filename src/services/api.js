// Cliente HTTP para miralib_backend (Spring Boot).
// En desarrollo, Vite redirige /api a http://localhost:8080 (ver vite.config.js).
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const PORTADA_POR_DEFECTO = '/portada.svg';

const pedir = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  const texto = await respuesta.text();
  if (!respuesta.ok) {
    throw new Error(texto || `Error ${respuesta.status} al llamar a ${ruta}`);
  }
  return texto ? JSON.parse(texto) : null;
};

// "2026-12-04" (backend) -> "04-12-2026" (como se muestra en MiraLib)
const aFechaChilena = (iso) => (iso ? iso.split('-').reverse().join('-') : '');

// --- Libros ---

// Convierte el libro del backend (Book.java) al formato que usan los componentes.
export const aLibroFront = (b) => ({
  id: b.id,
  titulo: b.nombreLibro,
  autor: b.autorLibro,
  categoria: b.categoriaLibro,
  sinopsis: b.sipnosisLibro,
  stock: b.stock,
  compartidor: b.nombreCompartidor,
  fechaDeEntrega: b.fechaDeEntrega,
  imagen: b.imagen || PORTADA_POR_DEFECTO, // portada guardada en el backend, o la genérica si no tiene
  proximamente: b.proximamente === true,
});

export const obtenerLibros = async () => (await pedir('/books')).map(aLibroFront);

export const obtenerLibro = async (id) => {
  const libro = await pedir(`/books/id?id=${encodeURIComponent(id)}`);
  return libro ? aLibroFront(libro) : null;
};

// --- Usuarios ---

export const obtenerUsuarios = () => pedir('/users');

export const registrarUsuario = ({ nombre, email, password }) =>
  pedir('/users/add', {
    method: 'POST',
    // id: 0 => JPA lo trata como usuario nuevo y MySQL genera el id.
    // (Es obligatorio: User.id es int primitivo y el backend rechaza el JSON sin id.)
    body: JSON.stringify({ id: 0, nombre, correo: email, contrasena: password }),
  });

// --- Pedidos (Pedido.java) ---

// Convierte el pedido del backend al formato que usan Perfil y LibrosPedidos.
const aPedidoFront = (p) => ({
  id: p.id,
  idLibro: p.libro.id,
  libro: aLibroFront(p.libro),
  fechaPedido: aFechaChilena(p.fechaPedido),
  fechaDevolucion: aFechaChilena(p.fechaDevolucion),
  estado: p.estado, // "Vigente" | "Vencido" | "Devuelto"
});

export const obtenerPedidos = async (usuarioId) =>
  (await pedir(`/pedidos/usuario/${usuarioId}`)).map(aPedidoFront);

// Crea el pedido y descuenta stock en el backend. Devuelve el pedido con el libro actualizado.
export const crearPedido = async (usuarioId, libroId) =>
  aPedidoFront(
    await pedir('/pedidos/add', {
      method: 'POST',
      body: JSON.stringify({ usuarioId, libroId }),
    })
  );

// Devuelve el libro: +1 stock y el pedido queda "Devuelto".
export const devolverPedido = async (pedidoId) =>
  aPedidoFront(await pedir(`/pedidos/devolver/${pedidoId}`, { method: 'PUT' }));

// Re-Solicitar: +7 días a la fecha de devolución.
export const extenderPedido = async (pedidoId) =>
  aPedidoFront(await pedir(`/pedidos/extender/${pedidoId}`, { method: 'PUT' }));
