import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { obtenerLibros } from './services/api';

vi.mock('./services/api', () => ({
  obtenerLibros: vi.fn(),
  obtenerLibro: vi.fn(),
  obtenerPedidos: vi.fn(),
  crearPedido: vi.fn(),
  obtenerUsuarios: vi.fn(),
  registrarUsuario: vi.fn(),
  devolverPedido: vi.fn(),
  extenderPedido: vi.fn(),
}));

// Navegación: App usa BrowserRouter, así que se cambia la URL antes de renderizar
const visitar = (ruta) => {
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

describe('Navegación de la aplicación', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    obtenerLibros.mockResolvedValue([]);
  });

  it('NAV-01: / muestra Inicio con la barra de navegación', async () => {
    visitar('/');
    expect(await screen.findByText('Recién Agregados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Perfil' })).toBeInTheDocument();
  });

  it('NAV-02: /libros muestra el catálogo', async () => {
    visitar('/libros');
    expect(await screen.findByText('Catálogo de Libros')).toBeInTheDocument();
  });

  it('NAV-03: /login muestra el formulario de inicio de sesión', () => {
    visitar('/login');
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('NAV-04: /registro muestra el formulario de registro', () => {
    visitar('/registro');
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
  });

  it('NAV-05: /perfil sin sesión pide iniciar sesión', () => {
    visitar('/perfil');
    expect(screen.getByText('No has iniciado sesión')).toBeInTheDocument();
  });

  it('NAV-06: /nosotros muestra la información del proyecto', () => {
    visitar('/nosotros');
    expect(screen.getByRole('heading', { name: 'Sobre Nosotros' })).toBeInTheDocument();
  });
});
