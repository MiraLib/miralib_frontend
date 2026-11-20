import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TarjetaLibro from './TarjetaLibro';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const libro = {
  id: 2,
  titulo: 'Clean Code',
  autor: 'Robert C. Martin',
  imagen: 'https://portadas.test/clean-code.jpg',
  stock: 4,
  proximamente: false,
};

const renderTarjeta = (props) =>
  render(
    <MemoryRouter>
      <TarjetaLibro libro={libro} {...props} />
    </MemoryRouter>
  );

describe('Componente TarjetaLibro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra portada, título, autor y stock', () => {
    renderTarjeta();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    expect(screen.getByText('Stock: 4')).toBeInTheDocument();
    expect(screen.getByAltText('Portada de Clean Code')).toHaveAttribute('src', libro.imagen);
  });

  it('con stock y sin pedir muestra el botón "Pedir" habilitado', () => {
    renderTarjeta();
    expect(screen.getByRole('button', { name: 'Pedir' })).toBeEnabled();
  });

  it('si el usuario ya lo tiene muestra "Solicitado" deshabilitado', () => {
    const onPedir = vi.fn();
    renderTarjeta({ solicitado: true, onPedir });

    const boton = screen.getByRole('button', { name: 'Solicitado' });
    expect(boton).toBeDisabled();
    fireEvent.click(boton);
    expect(onPedir).not.toHaveBeenCalled();
  });

  it('sin stock muestra "Agotado" en la etiqueta y en el botón deshabilitado', () => {
    renderTarjeta({ libro: { ...libro, stock: 0 } });
    expect(screen.getAllByText('Agotado')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });

  it('un libro de próximamente no se puede pedir', () => {
    renderTarjeta({ libro: { ...libro, proximamente: true } });
    expect(screen.getByRole('button', { name: 'Próximamente' })).toBeDisabled();
  });

  it('al pedir llama a onPedir y actualiza el stock con la respuesta del backend', async () => {
    const onPedir = vi.fn().mockResolvedValue({ ...libro, stock: 3 });
    renderTarjeta({ onPedir });

    fireEvent.click(screen.getByRole('button', { name: 'Pedir' }));

    expect(onPedir).toHaveBeenCalledWith(libro);
    expect(await screen.findByText('Stock: 3')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled(); // pedir no abre el detalle
  });

  it('si el pedido falla mantiene el stock', async () => {
    const onPedir = vi.fn().mockResolvedValue(null);
    renderTarjeta({ onPedir });

    fireEvent.click(screen.getByRole('button', { name: 'Pedir' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Pedir' })).toBeEnabled());
    expect(screen.getByText('Stock: 4')).toBeInTheDocument();
  });

  it('al hacer clic en la tarjeta abre el detalle del libro', () => {
    renderTarjeta();
    fireEvent.click(screen.getByText('Clean Code'));
    expect(navigateMock).toHaveBeenCalledWith('/libro/2');
  });

  it('el hover cambia el estilo de la tarjeta y del botón disponible', () => {
    renderTarjeta();
    const boton = screen.getByRole('button', { name: 'Pedir' });

    fireEvent.mouseEnter(boton);
    expect(boton.style.color).toBe('white');
    fireEvent.mouseLeave(boton);
    expect(boton.style.backgroundColor).toBe('transparent');

    const tarjeta = boton.closest('div').parentElement;
    fireEvent.mouseEnter(tarjeta);
    expect(tarjeta.style.transform).toBe('scale(1.02)');
    fireEvent.mouseLeave(tarjeta);
    expect(tarjeta.style.transform).toBe('scale(1)');
  });

  it('el hover no cambia el botón cuando no se puede pedir', () => {
    renderTarjeta({ solicitado: true });
    const boton = screen.getByRole('button', { name: 'Solicitado' });
    fireEvent.mouseEnter(boton);
    fireEvent.mouseLeave(boton);
    expect(boton.style.color).toBe('white'); // estilo fijo de "Solicitado"
  });
});
