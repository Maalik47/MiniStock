import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'No fue posible iniciar sesion. Verifica tus credenciales.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="brand-mark">MS</span>
          <div>
            <h1>MiniStock</h1>
            <p>Gestion sencilla de inventario</p>
          </div>
        </div>

        <label htmlFor="email">Correo electronico</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="admin@ministock.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Contrasena</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Tu contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesion'}
        </button>
      </form>
    </div>
  )
}
