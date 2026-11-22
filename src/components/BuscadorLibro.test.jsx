import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BuscadorLibro from './BuscadorLibro';

describe('Componente BuscadorLibro', () => {
  it('debe mostrar el título y el input', () => {
    const handleBusqueda = vi.fn();
    render(<BuscadorLibro busqueda="" setBusqueda={handleBusqueda} />);
    
    expect(screen.getByText('Catálogo de Libros')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por título, autor o palabra clave...')).toBeInTheDocument();
  });

  it('debe llamar a setBusqueda con el texto escrito', () => {
    const handleBusqueda = vi.fn();
    render(<BuscadorLibro busqueda="" setBusqueda={handleBusqueda} />);

    // Simula que el usuario escribe en el buscador
    fireEvent.change(screen.getByPlaceholderText('Buscar por título, autor o palabra clave...'), {
      target: { value: 'Tolkien' },
    });

    expect(handleBusqueda).toHaveBeenCalledWith('Tolkien');
  });

  it('debe mostrar en el input la búsqueda actual', () => {
    render(<BuscadorLibro busqueda="Clean Code" setBusqueda={vi.fn()} />);

    expect(screen.getByPlaceholderText('Buscar por título, autor o palabra clave...')).toHaveValue('Clean Code');
  });
});