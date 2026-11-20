import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FiltroLibro from './FiltroLibro';

const categorias = ['Fantasía', 'Programación'];

describe('Componente FiltroLibro', () => {
  it('muestra un checkbox por categoría', () => {
    render(<FiltroLibro categoriasUnicas={categorias} categoriasSeleccionadas={[]} setCategoriasSeleccionadas={vi.fn()} />);

    expect(screen.getByLabelText('Fantasía')).not.toBeChecked();
    expect(screen.getByLabelText('Programación')).not.toBeChecked();
  });

  it('marcar una categoría la agrega a la selección', () => {
    const setSeleccion = vi.fn();
    render(<FiltroLibro categoriasUnicas={categorias} categoriasSeleccionadas={['Fantasía']} setCategoriasSeleccionadas={setSeleccion} />);

    fireEvent.click(screen.getByLabelText('Programación'));

    expect(setSeleccion).toHaveBeenCalledWith(['Fantasía', 'Programación']);
  });

  it('desmarcar una categoría la quita de la selección', () => {
    const setSeleccion = vi.fn();
    render(<FiltroLibro categoriasUnicas={categorias} categoriasSeleccionadas={['Fantasía', 'Programación']} setCategoriasSeleccionadas={setSeleccion} />);

    expect(screen.getByLabelText('Fantasía')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Fantasía'));

    expect(setSeleccion).toHaveBeenCalledWith(['Programación']);
  });
});
