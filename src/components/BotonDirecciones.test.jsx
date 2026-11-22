import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BotonDirecciones from './BotonDirecciones';

describe('Componente BotonDirecciones', () => {
  it('debe renderizar el botón con el texto correcto', () => {
    render(<BotonDirecciones texto="Haz clic aquí" />);
    // Verifica que el texto "Haz clic aquí" esté en el documento
    expect(screen.getByText('Haz clic aquí')).toBeInTheDocument();
  });

  it('debe ejecutar la función onClick cuando se hace clic', () => {
    // vi.fn() crea una función "espía" simulada
    const handleClick = vi.fn(); 
    render(<BotonDirecciones texto="Clic" onClick={handleClick} />);
    
    // Simula un clic en el botón
    const boton = screen.getByText('Clic');
    fireEvent.click(boton);
    
    // Verifica que la función espía fue llamada una vez
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('por defecto es un botón habilitado, sin borde y con cursor de mano', () => {
    render(<BotonDirecciones texto="Entrar" />);
    const boton = screen.getByRole('button', { name: 'Entrar' });

    expect(boton).toBeEnabled();
    expect(boton).toHaveAttribute('type', 'button');
    expect(boton.style.borderStyle).toBe('none');
    expect(boton.style.cursor).toBe('pointer');
  });

  it('con fondo transparente muestra un borde del color del texto', () => {
    // Variante usada por "Cerrar Sesión" en el perfil
    render(<BotonDirecciones texto="Cerrar Sesión" colorFondo="transparent" colorTexto="red" />);
    const boton = screen.getByRole('button', { name: 'Cerrar Sesión' });

    expect(boton.style.backgroundColor).toBe('transparent');
    expect(boton.style.border).toBe('1px solid red');
  });

  it('deshabilitado no ejecuta onClick y muestra el cursor de no permitido', () => {
    const handleClick = vi.fn();
    render(<BotonDirecciones texto="Agotado" onClick={handleClick} deshabilitado />);
    const boton = screen.getByRole('button', { name: 'Agotado' });

    expect(boton).toBeDisabled();
    expect(boton.style.cursor).toBe('not-allowed');
    fireEvent.click(boton);
    expect(handleClick).not.toHaveBeenCalled();
  });
});