import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LibrosPedidos from './LibrosPedidos';

const infoLibro = { id: 2, titulo: 'Clean Code', imagen: 'https://portadas.test/clean-code.jpg' };
const pedido = { id: 10, idLibro: 2, fechaPedido: '20-11-2026', fechaDevolucion: '04-12-2026', estado: 'Vigente' };

describe('Componente LibrosPedidos', () => {
  it('un pedido vigente muestra fechas y las acciones Devolver y Extender plazo', () => {
    render(<LibrosPedidos pedido={pedido} infoLibro={infoLibro} manejarDevolucion={vi.fn()} manejarResolicitar={vi.fn()} />);

    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('20-11-2026')).toBeInTheDocument();
    expect(screen.getByText('04-12-2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Devolver' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Extender plazo' })).toBeInTheDocument();
  });

  it('los botones envían el id del pedido (no el del libro)', () => {
    const manejarDevolucion = vi.fn();
    const manejarResolicitar = vi.fn();
    render(<LibrosPedidos pedido={pedido} infoLibro={infoLibro} manejarDevolucion={manejarDevolucion} manejarResolicitar={manejarResolicitar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Devolver' }));
    fireEvent.click(screen.getByRole('button', { name: 'Extender plazo' }));

    expect(manejarDevolucion).toHaveBeenCalledWith(10);
    expect(manejarResolicitar).toHaveBeenCalledWith(10);
  });

  it('un pedido vencido indica "(Vencido)" y sigue teniendo acciones', () => {
    render(<LibrosPedidos pedido={{ ...pedido, estado: 'Vencido' }} infoLibro={infoLibro} manejarDevolucion={vi.fn()} manejarResolicitar={vi.fn()} />);

    expect(screen.getByText(/\(Vencido\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Devolver' })).toBeInTheDocument();
  });

  it('un pedido devuelto es solo historial: muestra "Devuelto" y no tiene botones', () => {
    render(<LibrosPedidos pedido={{ ...pedido, estado: 'Devuelto' }} infoLibro={infoLibro} />);

    expect(screen.getByText('Devuelto')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
