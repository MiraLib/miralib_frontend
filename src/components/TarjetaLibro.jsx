import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { estadoLibro } from '../hooks/useMisPedidos';

// Estilos del botón según el estado del libro para el usuario
const ESTILOS_BOTON = {
  disponible: { backgroundColor: 'transparent', border: '1px solid var(--accent)', color: 'var(--text-h)', cursor: 'pointer' },
  solicitado: { backgroundColor: 'var(--accent)', border: '1px solid var(--accent)', color: 'white', cursor: 'default' },
  agotado: { backgroundColor: 'gray', border: '1px solid gray', color: 'white', cursor: 'not-allowed' },
  proximamente: { backgroundColor: 'gray', border: '1px solid gray', color: 'white', cursor: 'not-allowed' },
};

// solicitado: el usuario ya tiene este libro sin devolver.
// onPedir(libro): crea el pedido en el backend y devuelve el libro actualizado (o null si falló).
const TarjetaLibro = ({ libro, solicitado = false, onPedir }) => {
  const navigate = useNavigate();
  // Stock en pantalla (viene del backend y se actualiza al pedir)
  const [stockActual, setStockActual] = useState(libro.stock);
  const [enviando, setEnviando] = useState(false);

  const estado = estadoLibro(libro, stockActual, solicitado);
  const estaAgotado = stockActual <= 0;

  const irADetalles = () => navigate(`/libro/${libro.id}`);

  const manejarPedir = async (e) => {
    e.stopPropagation();
    if (!estado.puedePedir || enviando || !onPedir) return;

    setEnviando(true);
    const libroActualizado = await onPedir(libro);
    setEnviando(false);
    if (libroActualizado) setStockActual(libroActualizado.stock);
  };

  return (
    <div
      onClick={irADetalles}
      style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg)',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        opacity: estado.tipo === 'agotado' ? '0.7' : '1'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ height: '260px', display: 'flex', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
        <img
          src={libro.imagen}
          alt={`Portada de ${libro.titulo}`}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
        />
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          backgroundColor: estaAgotado ? 'red' : 'var(--accent)',
          color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
        }}>
          {estaAgotado ? 'Agotado' : `Stock: ${stockActual}`}
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem', flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{libro.titulo}</h3>
        <p style={{ color: 'gray', fontSize: '0.85rem', margin: 0, textTransform: 'uppercase' }}>{libro.autor}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={manejarPedir}
          disabled={!estado.puedePedir || enviando}
          title={estado.tipo === 'solicitado' ? 'Ya tienes este libro. Puedes devolverlo desde tu Perfil.' : undefined}
          style={{
            padding: '0.6rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            ...ESTILOS_BOTON[estado.tipo],
          }}
          onMouseEnter={(e) => {
            if (estado.puedePedir) {
              e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            if (estado.puedePedir) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-h)';
            }
          }}
        >
          {enviando ? 'Pidiendo...' : estado.texto}
        </button>
      </div>
    </div>
  );
};

export default TarjetaLibro;
