import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Registro from './Registro';
import { obtenerUsuarios, registrarUsuario } from '../services/api';

vi.mock('../services/api', () => ({ obtenerUsuarios: vi.fn(), registrarUsuario: vi.fn() }));

const renderRegistro = () =>
  render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>
  );

const completar = () => {
  fireEvent.change(screen.getByPlaceholderText('Tu Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByPlaceholderText('Correo electronico'), { target: { value: 'ana@miralib.test' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'clave123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
};

describe('Página Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('los tres campos son obligatorios', () => {
    renderRegistro();
    expect(screen.getByPlaceholderText('Tu Nombre')).toBeRequired();
    expect(screen.getByPlaceholderText('Correo electronico')).toBeRequired();
    expect(screen.getByPlaceholderText('Contraseña')).toBeRequired();
  });

  it('registra un usuario nuevo en el backend y redirige al login', async () => {
    obtenerUsuarios.mockResolvedValue([]);
    registrarUsuario.mockResolvedValue({ id: 5 });
    renderRegistro();

    completar();

    expect(await screen.findByText('Página de login')).toBeInTheDocument();
    expect(registrarUsuario).toHaveBeenCalledWith({ nombre: 'Ana', email: 'ana@miralib.test', password: 'clave123' });
    expect(window.alert).toHaveBeenCalledWith('Registro exitoso. Ahora puedes iniciar sesión.');
  });

  it('no permite registrar un correo que ya existe', async () => {
    obtenerUsuarios.mockResolvedValue([{ id: 1, correo: 'ana@miralib.test' }]);
    renderRegistro();

    completar();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Este correo ya está registrado.'));
    expect(registrarUsuario).not.toHaveBeenCalled();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
  });

  it('si el servidor falla avisa y se queda en el formulario', async () => {
    obtenerUsuarios.mockRejectedValue(new Error('Failed to fetch'));
    renderRegistro();

    completar();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo conectar con el servidor de MiraLib.'));
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
  });
});
