import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { obtenerUsuarios } from '../services/api';
import { obtenerSesion } from '../services/sesion';

vi.mock('../services/api', () => ({ obtenerUsuarios: vi.fn() }));

const usuarios = [{ id: 1, nombre: 'Exequiel', correo: 'exe@miralib.test', contrasena: 'clave123' }];

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<p>Página de perfil</p>} />
      </Routes>
    </MemoryRouter>
  );

const ingresar = (email, password) => {
  fireEvent.change(screen.getByPlaceholderText('Correo electronico'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
};

describe('Página Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra el formulario con enlace a registro y la contraseña oculta', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Regístrate aquí' })).toHaveAttribute('href', '/registro');
  });

  it('con credenciales válidas guarda la sesión (sin contraseña) y va al perfil', async () => {
    obtenerUsuarios.mockResolvedValue(usuarios);
    renderLogin();

    ingresar('exe@miralib.test', 'clave123');

    expect(await screen.findByText('Página de perfil')).toBeInTheDocument();
    expect(obtenerSesion()).toEqual({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
  });

  it('con contraseña incorrecta muestra error y no inicia sesión', async () => {
    obtenerUsuarios.mockResolvedValue(usuarios);
    renderLogin();

    ingresar('exe@miralib.test', 'otra');

    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    expect(obtenerSesion()).toBeNull();
  });

  it('si el servidor no responde lo informa', async () => {
    obtenerUsuarios.mockRejectedValue(new Error('Failed to fetch'));
    renderLogin();

    ingresar('exe@miralib.test', 'clave123');

    expect(await screen.findByText('No se pudo conectar con el servidor de MiraLib.')).toBeInTheDocument();
  });
});
