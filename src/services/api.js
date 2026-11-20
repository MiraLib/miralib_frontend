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

// Descuenta 1 de stock en el backend y devuelve el libro actualizado.
export const pedirLibro = async (id) => aLibroFront(await pedir(`/books/send/${id}`, { method: 'PUT' }));

// Suma 1 de stock en el backend (no hay endpoint dedicado, así que se re-guarda el libro).
export const devolverLibro = async (id) => {
  const libro = await pedir(`/books/id?id=${encodeURIComponent(id)}`);
  if (!libro) throw new Error('Libro no encontrado');
  return aLibroFront(
    await pedir('/books/add', {
      method: 'POST',
      body: JSON.stringify({ ...libro, stock: libro.stock + 1 }),
    })
  );
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
