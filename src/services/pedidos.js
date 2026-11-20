// El backend todavía no tiene pedidos, así que se guardan en localStorage por usuario.
const clave = (email) => `pedidos_${email}`;

export const obtenerPedidos = (email) => JSON.parse(localStorage.getItem(clave(email))) || [];

export const guardarPedidos = (email, pedidos) =>
  localStorage.setItem(clave(email), JSON.stringify(pedidos));

// Actualiza la sesión activa y su lista de pedidos de una vez.
export const guardarSesion = (usuario) => {
  localStorage.setItem('usuarioLogeado', JSON.stringify(usuario));
  guardarPedidos(usuario.email, usuario.pedidos || []);
};
