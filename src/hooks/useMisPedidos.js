import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPedidos, crearPedido } from '../services/api';
import { obtenerSesion } from '../services/sesion';

// Estado del botón de un libro para el usuario actual (una sola regla para toda la app).
// Prioridad: Próximamente > Solicitado (ya lo tiene) > Agotado > Pedir.
export const estadoLibro = (libro, stock, solicitado) => {
  if (libro.proximamente) return { texto: 'Próximamente', puedePedir: false, tipo: 'proximamente' };
  if (solicitado) return { texto: 'Solicitado', puedePedir: false, tipo: 'solicitado' };
  if (stock <= 0) return { texto: 'Agotado', puedePedir: false, tipo: 'agotado' };
  return { texto: 'Pedir', puedePedir: true, tipo: 'disponible' };
};

// Libros que el usuario logeado tiene sin devolver (Vigente o Vencido), cargados del backend,
// y la acción de pedir un libro (valida sesión, llama al backend y actualiza el estado).
export const useMisPedidos = () => {
  const navigate = useNavigate();
  const [usuario] = useState(obtenerSesion);
  const [solicitados, setSolicitados] = useState(() => new Set());

  useEffect(() => {
    if (!usuario) return;
    obtenerPedidos(usuario.id)
      .then(pedidos => setSolicitados(new Set(
        pedidos.filter(p => p.estado !== 'Devuelto').map(p => p.idLibro)
      )))
      .catch(() => {}); // sin conexión: los botones quedan en "Pedir" y el backend valida igual
  }, [usuario]);

  // Devuelve el libro actualizado (nuevo stock) si el pedido se creó, o null si no.
  const pedirLibro = async (libro) => {
    if (!usuario) {
      alert('Debes iniciar sesión para pedir un libro.');
      navigate('/login');
      return null;
    }
    try {
      const pedido = await crearPedido(usuario.id, libro.id);
      setSolicitados(prev => new Set(prev).add(libro.id));
      alert(`¡Éxito! Has pedido: ${libro.titulo}`);
      return pedido.libro;
    } catch (error) {
      alert(error.message || 'No se pudo pedir el libro.');
      return null;
    }
  };

  return { solicitados, pedirLibro };
};
