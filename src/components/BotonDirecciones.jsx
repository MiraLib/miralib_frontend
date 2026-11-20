import React from 'react';

const BotonDirecciones = ({ texto, tipo = "button", onClick, colorFondo = "var(--accent)", colorTexto = "white", ancho = "100%", deshabilitado = false }) => {
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      style={{
        padding: '0.8rem 2rem',
        backgroundColor: colorFondo,
        color: colorTexto,
        border: colorFondo === 'transparent' ? `1px solid ${colorTexto}` : 'none',
        borderRadius: '4px',
        cursor: deshabilitado ? 'not-allowed' : 'pointer',
        width: ancho,
        fontWeight: 'bold'
      }}>
      {texto}
    </button>
  );
};

export default BotonDirecciones;