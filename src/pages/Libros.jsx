import React, { useState, useEffect } from 'react';
import { obtenerLibros } from '../services/api';
import TarjetaLibro from '../components/TarjetaLibro';
import BuscadorLibro from '../components/BuscadorLibro';
import FiltroLibro from '../components/FiltroLibro';

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // ¡CAMBIO CLAVE! Ahora es un arreglo vacío [] en lugar de un texto ''
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]); 

  useEffect(() => {
    obtenerLibros()
      .then(todos => setLibros(todos.filter(l => !l.proximamente))) // los de "Próximamente" no se pueden pedir aún
      .catch(() => setError('No se pudo conectar con el servidor de MiraLib.'))
      .finally(() => setCargando(false));
  }, []);

  const categoriasUnicas = [...new Set(libros.map(libro => libro.categoria).filter(Boolean))];

  // Lógica de filtrado actualizada para múltiples categorías
  const librosFiltrados = libros.filter(libro => {
    const coincideTexto = (libro.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (libro.autor || '').toLowerCase().includes(busqueda.toLowerCase());
                          
    // Si no hay categorías marcadas (arreglo vacío), mostramos todas.
    // Si hay categorías, verificamos si la categoría del libro está en nuestro arreglo de seleccionadas.
    const coincideCategoria = categoriasSeleccionadas.length === 0 || 
                              categoriasSeleccionadas.includes(libro.categoria);
    
    return coincideTexto && coincideCategoria;
  });

  return (
    <main className="container" style={{ padding: '3rem 0' }}> 
      <div className="row">
        
        {/* --- COLUMNA LATERAL (FILTROS) --- */}
        <aside className="col-12 col-md-3 mb-4">
          <div className="sticky-md-top" style={{ top: '100px' }}>
            <FiltroLibro 
              categoriasUnicas={categoriasUnicas} 
              categoriasSeleccionadas={categoriasSeleccionadas} 
              setCategoriasSeleccionadas={setCategoriasSeleccionadas} 
            />
          </div>
        </aside>

        {/* --- COLUMNA PRINCIPAL (BUSCADOR + LIBROS) --- */}
        <section className="col-12 col-md-9">
          
          <div className="row mb-4">
            <div className="col-12">
              <BuscadorLibro busqueda={busqueda} setBusqueda={setBusqueda} />
            </div>
          </div>
          
          {/* ELIMINAMOS EL H2 QUE DECÍA "Catálogo Completo" AQUÍ */}

          {/* GRILLA DE LIBROS */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {cargando ? (
              <div className="col-12 text-center py-5"><p style={{ color: 'gray' }}>Cargando libros...</p></div>
            ) : error ? (
              <div className="col-12 text-center py-5"><p style={{ color: 'red' }}>{error}</p></div>
            ) : librosFiltrados.length > 0 ? (
              librosFiltrados.map(libro => (
                <div className="col" key={libro.id}>
                  <TarjetaLibro libro={libro} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p style={{ fontSize: '1.2rem', color: 'gray' }}>
                  No se encontraron libros que coincidan con tu búsqueda.
                </p>
                <button 
                  onClick={() => { setBusqueda(''); setCategoriasSeleccionadas([]); }}
                  className="btn btn-link" 
                  style={{ color: 'var(--accent)' }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

        </section>

      </div>
    </main>
  );
};

export default Libros;