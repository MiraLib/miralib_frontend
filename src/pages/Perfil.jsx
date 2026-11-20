import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BotonDirecciones from '../components/BotonDirecciones';
import LibrosPedidos from '../components/LibrosPedidos'; 
import { obtenerPedidos, devolverPedido, extenderPedido } from '../services/api';
import { obtenerSesion, cerrarSesion as borrarSesion } from '../services/sesion';

const Perfil = () => {
  const [usuario] = useState(obtenerSesion);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Los pedidos del usuario vienen del backend
  const cargarPedidos = (usuarioId) =>
    obtenerPedidos(usuarioId)
      .then(lista => { setPedidos(lista); setError(''); })
      .catch(() => setError('No se pudieron cargar tus pedidos desde el servidor de MiraLib.'));

  useEffect(() => {
    if (usuario) cargarPedidos(usuario.id);
  }, [usuario]);

  // Activos = Vigente o Vencido (se pueden devolver/extender); devueltos = historial
  const activos = pedidos.filter(p => p.estado !== 'Devuelto');
  const devueltos = pedidos.filter(p => p.estado === 'Devuelto');

  const cerrarSesion = () => {
    borrarSesion();
    navigate('/login');
  };

  //  DEVOLUCIÓN y STOCK (el backend suma 1 al stock y marca el pedido como "Devuelto")
  const manejarDevolucion = async (idPedido) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas devolver este libro?");

    if (confirmar) {
      try {
        await devolverPedido(idPedido);
      } catch (error) {
        alert(error.message || 'No se pudo devolver el libro.');
        return;
      }
      await cargarPedidos(usuario.id);
      alert('¡Libro devuelto con éxito! El stock en el catálogo ha aumentado.');
    }
  };

  // Re-Solicitar: el backend extiende la devolución 7 días
  const manejarResolicitar = async (idPedido) => {
    try {
      await extenderPedido(idPedido);
    } catch (error) {
      alert(error.message || 'No se pudo extender el plazo.');
      return;
    }
    await cargarPedidos(usuario.id);
    alert('Se ha extendido tu plazo de devolución por 7 días más.');
  };

  if (!usuario) {
    return (
      <main className="container text-center" style={{ padding: '6rem 2rem' }}>
        <h2>No has iniciado sesión</h2>
        <p className="mt-3 mb-5">Para ver tu perfil y tus libros pedidos en MiraLib, necesitas identificarte.</p>
        <Link to="/login" className="btn" style={{ backgroundColor: 'var(--accent)', color: 'white', fontWeight: 'bold' }}>
          Ir a Iniciar Sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '3rem 0', maxWidth: '1000px' }}>
      
      <div 
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3" 
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-md-4">
          <h1 className="mb-2 mb-md-0" style={{ margin: 0 }}>Mi Perfil</h1>
          <p className="mb-0" style={{ fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--text-h)' }}>{usuario.nombre}</span> ({usuario.email})
          </p>
        </div>
        
        <div className="mt-3 mt-md-0">
          <BotonDirecciones texto="Cerrar Sesión" onClick={cerrarSesion} colorFondo="transparent" colorTexto="red" ancho="fit-content" />
        </div>
      </div>

      <h3 className="mb-4">Libros Pedidos</h3>

      {error ? (
        <p className="text-center mt-4" style={{ color: 'red' }}>{error}</p>
      ) : activos.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {activos.map(pedido => (
            <LibrosPedidos
              key={pedido.id}
              pedido={pedido}
              infoLibro={pedido.libro}
              manejarDevolucion={manejarDevolucion}
              manejarResolicitar={manejarResolicitar}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-4">No tienes libros pedidos en este momento.</p>
      )}

      {!error && devueltos.length > 0 && (
        <>
          <h3 className="mt-5 mb-4" style={{ color: 'gray' }}>Historial de devoluciones</h3>
          <div className="d-flex flex-column gap-3">
            {devueltos.map(pedido => (
              <LibrosPedidos key={pedido.id} pedido={pedido} infoLibro={pedido.libro} />
            ))}
          </div>
        </>
      )}

    </main>
  );
};

export default Perfil;