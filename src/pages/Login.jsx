import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BloqueInput from '../components/BloqueInput';
import BotonDirecciones from '../components/BotonDirecciones';
import { obtenerUsuarios } from '../services/api';
import { obtenerPedidos, guardarSesion } from '../services/pedidos';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');

    let usuarios;
    try {
      usuarios = await obtenerUsuarios();
    } catch {
      setError('No se pudo conectar con el servidor de MiraLib.');
      return;
    }

    // El backend aún no tiene endpoint de login, así que se valida contra la lista de usuarios
    const usuarioValido = usuarios.find(user => user.correo === email && user.contrasena === password);

    if (usuarioValido) {
      guardarSesion({
        id: usuarioValido.id,
        nombre: usuarioValido.nombre,
        email: usuarioValido.correo,
        pedidos: obtenerPedidos(usuarioValido.correo),
      });
      navigate('/perfil');
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <main style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Iniciar Sesión</h1>
      
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <BloqueInput 
          tipo="email" 
          placeholder="Correo electronico" 
          valor={email} 
          alCambiar={(e) => setEmail(e.target.value)} 
        />
        <BloqueInput 
          tipo="password" 
          placeholder="Contraseña" 
          valor={password} 
          alCambiar={(e) => setPassword(e.target.value)} 
        />
        <BotonDirecciones tipo="submit" texto="Entrar" />
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--accent)' }}>Regístrate aquí</Link>
      </p>
    </main>
  );
};

export default Login;