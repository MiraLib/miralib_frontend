// src/pages/VistaLibro.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerLibro } from '../services/api';
import BotonDirecciones from '../components/BotonDirecciones';
import { useMisPedidos, estadoLibro } from '../hooks/useMisPedidos';

const VistaLibro = () => {
  // useParams extrae el "/:id" de la URL
  const { id } = useParams();

  const [libro, setLibro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const { solicitados, pedirLibro } = useMisPedidos();

  const manejarPedir = async () => {
    setEnviando(true);
    const libroActualizado = await pedirLibro(libro);
    setEnviando(false);
    if (libroActualizado) setLibro(prev => ({ ...prev, stock: libroActualizado.stock }));
  };

  // Pedimos el libro al backend
  useEffect(() => {
    obtenerLibro(id)
      .then(setLibro)
      .catch(() => setLibro(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <main style={{ padding: '4rem 2rem', textAlign: 'center' }}><p>Cargando libro...</p></main>;
  }

  // Si el usuario inventa un ID en la URL que no existe
  if (!libro) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Libro no encontrado</h2>
        <Link to="/libros" style={{ color: 'var(--accent)' }}>Volver al catálogo</Link>
      </main>
    );
  }

  const estado = estadoLibro(libro, libro.stock, solicitados.has(libro.id));

  return (
    <main style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <Link to="/libros" style={{ color: 'var(--accent)', marginBottom: '2rem', display: 'inline-block' }}>
        ← Volver al catálogo
      </Link>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <img 
          src={libro.imagen} 
          alt={libro.titulo} 
          style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', objectFit: 'cover' }} 
        />
        
        <div style={{ flex: '1', minWidth: '300px', textAlign: 'left' }}>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>{libro.titulo}</h1>
          <h3 style={{ color: 'gray', margin: '0 0 1rem 0', fontWeight: 'normal' }}>{libro.autor}</h3>
          
          <p style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--accent-bg)', 
            color: 'var(--text-h)', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '12px', 
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            {libro.categoria}
          </p>

          <h2>Sinopsis</h2>
          <p style={{ lineHeight: '1.6', marginTop: '1rem' }}>{libro.sinopsis}</p>
          
          <p style={{ marginTop: '1.5rem', color: libro.stock > 0 ? 'var(--text)' : 'red' }}>
            {libro.proximamente
              ? 'Este libro estará disponible próximamente.'
              : libro.stock > 0 ? `Disponibles: ${libro.stock}` : 'Agotado por ahora.'}
          </p>

          <div style={{ marginTop: '2rem' }}>
            <BotonDirecciones
              texto={enviando ? 'Pidiendo...' : estado.puedePedir ? 'Pedir este libro ahora' : estado.texto}
              onClick={manejarPedir}
              deshabilitado={!estado.puedePedir || enviando}
              colorFondo={estado.puedePedir || estado.tipo === 'solicitado' ? 'var(--accent)' : 'gray'}
              ancho="fit-content"
            />
            {estado.tipo === 'solicitado' && (
              <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'gray' }}>
                Ya tienes este libro. Puedes devolverlo o extender el plazo desde <Link to="/perfil" style={{ color: 'var(--accent)' }}>tu Perfil</Link>.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VistaLibro;