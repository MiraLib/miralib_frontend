import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerSesion, guardarSesion, cerrarSesion } from './sesion';

describe('services/sesion', () => {
  beforeEach(() => localStorage.clear());

  it('no hay sesión si localStorage está vacío', () => {
    expect(obtenerSesion()).toBeNull();
  });

  it('guarda solo id, nombre y email (sin pedidos ni contraseña)', () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test', contrasena: 'x', pedidos: [] });

    expect(JSON.parse(localStorage.getItem('usuarioLogeado'))).toEqual({
      id: 1,
      nombre: 'Exequiel',
      email: 'exe@miralib.test',
    });
    expect(obtenerSesion()).toEqual({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
  });

  it('ignora sesiones antiguas sin id del backend', () => {
    localStorage.setItem('usuarioLogeado', JSON.stringify({ nombre: 'Viejo', email: 'v@miralib.test' }));
    expect(obtenerSesion()).toBeNull();
  });

  it('ignora datos corruptos en localStorage', () => {
    localStorage.setItem('usuarioLogeado', '{no es json');
    expect(obtenerSesion()).toBeNull();
  });

  it('cerrarSesion borra la sesión', () => {
    guardarSesion({ id: 1, nombre: 'Exequiel', email: 'exe@miralib.test' });
    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
  });
});
