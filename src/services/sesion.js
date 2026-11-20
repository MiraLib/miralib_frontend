// Sesión del usuario logeado en este navegador: { id, nombre, email }.
// Los pedidos ya NO se guardan aquí: viven en el backend (/api/v1/pedidos).
const CLAVE = 'usuarioLogeado';

export const obtenerSesion = () => {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE));
    // Sesiones antiguas (sin id del backend) no sirven para pedir libros
    return sesion && sesion.id ? sesion : null;
  } catch {
    return null;
  }
};

export const guardarSesion = ({ id, nombre, email }) =>
  localStorage.setItem(CLAVE, JSON.stringify({ id, nombre, email }));

export const cerrarSesion = () => localStorage.removeItem(CLAVE);
